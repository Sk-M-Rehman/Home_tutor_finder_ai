package com.hometutorfinder;

import com.hometutorfinder.entity.Subject;
import com.hometutorfinder.repository.SubjectRepository;
import com.hometutorfinder.repository.UserRepository;
import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApiIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired SubjectRepository subjects;

    long mathId;

    @BeforeEach
    void setup() {
        Subject s = new Subject();
        s.setName("Mathematics");
        mathId = subjects.save(s).getId();
    }

    String student(String email) {
        return """
            {"fullName":"Test Student","email":"%s","phone":"9876543210","password":"Passw0rdX","confirmPassword":"Passw0rdX",
             "role":"STUDENT","acceptTerms":true,"city":"Vijayawada","educationLevel":"Class 10","preferredLearningMode":"BOTH"}
            """.formatted(email);
    }

    String tutor(String email, int fee) {
        return """
            {"fullName":"Test Tutor","email":"%s","phone":"9876500000","password":"Passw0rdX","confirmPassword":"Passw0rdX",
             "role":"TUTOR","acceptTerms":true,"city":"Vijayawada","qualification":"M.Sc Maths","experienceYears":5,
             "teachingMode":"HOME","hourlyFee":%d,"subjectIds":[%d]}
            """.formatted(email, fee, mathId);
    }

    Cookie register(String json, int expected) throws Exception {
        MvcResult r = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().is(expected)).andReturn();
        return r.getResponse().getCookie("htf_token");
    }

    @Test
    void registrationHashesPasswordAndHidesIt() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(student("a@test.com")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(cookie().httpOnly("htf_token", true));
        String hash = users.findByEmailIgnoreCase("a@test.com").orElseThrow().getPasswordHash();
        assertTrue(hash.startsWith("$2"));
        assertNotEquals("Passw0rdX", hash);
    }

    @Test
    void duplicateEmailRejected() throws Exception {
        register(student("dup@test.com"), 201);
        register(student("dup@test.com"), 409);
    }

    @Test
    void loginValidAndInvalid() throws Exception {
        register(student("l@test.com"), 201);
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"l@test.com\",\"password\":\"Passw0rdX\"}"))
                .andExpect(status().isOk()).andExpect(cookie().exists("htf_token")).andExpect(jsonPath("$.role").value("STUDENT"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"l@test.com\",\"password\":\"wrong-pass1\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void roleEnforcement() throws Exception {
        Cookie s = register(student("s@test.com"), 201);
        Cookie t = register(tutor("t@test.com", 300), 201);
        mvc.perform(get("/api/tutors/me/profile").cookie(s)).andExpect(status().isForbidden());
        mvc.perform(get("/api/students/me/profile").cookie(t)).andExpect(status().isForbidden());
        mvc.perform(get("/api/students/me/profile")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/tutors/me/profile").cookie(t)).andExpect(status().isOk());
        mvc.perform(post("/api/requests/1/payment/order").cookie(t)).andExpect(status().isForbidden());
        mvc.perform(post("/api/requests/1/payment/order")).andExpect(status().isUnauthorized());
    }

    @Test
    void tutorSearchFilters() throws Exception {
        register(tutor("t1@test.com", 200), 201);
        register(tutor("t2@test.com", 500), 201);
        mvc.perform(get("/api/tutors")).andExpect(jsonPath("$.totalElements").value(2));
        mvc.perform(get("/api/tutors").param("maxFee", "300")).andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/tutors").param("minFee", "300")).andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/tutors").param("subject", "math")).andExpect(jsonPath("$.totalElements").value(2));
        mvc.perform(get("/api/tutors").param("subject", "physics")).andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(get("/api/tutors").param("teachingMode", "ONLINE")).andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(get("/api/tutors").param("sort", "hourlyFee,asc")).andExpect(jsonPath("$.content[0].hourlyFee").value(200.0));
    }

    @Test
    void requestWorkflowAndOwnership() throws Exception {
        Cookie s1 = register(student("s1@test.com"), 201);
        Cookie s2 = register(student("s2@test.com"), 201);
        Cookie t1 = register(tutor("tt1@test.com", 300), 201);
        Cookie t2 = register(tutor("tt2@test.com", 400), 201);

        String body = mvc.perform(get("/api/tutors").param("sort", "hourlyFee,asc")).andReturn().getResponse().getContentAsString();
        Number tutorId = JsonPath.read(body, "$.content[0].id");

        String create = """
            {"tutorId":%d,"subjectId":%d,"message":"Need help with algebra","requestedDate":"2099-01-01","requestedTime":"10:00"}
            """.formatted(tutorId.longValue(), mathId);
        String res = mvc.perform(post("/api/requests").cookie(s1).contentType(MediaType.APPLICATION_JSON).content(create))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("PENDING")).andReturn().getResponse().getContentAsString();
        Number reqId = JsonPath.read(res, "$.id");
        String accept = "{\"status\":\"ACCEPTED\"}";
        String url = "/api/requests/" + reqId + "/status";

        // the other tutor and students cannot touch it
        mvc.perform(patch(url).cookie(t2).contentType(MediaType.APPLICATION_JSON).content(accept)).andExpect(status().isForbidden());
        mvc.perform(patch(url).cookie(s1).contentType(MediaType.APPLICATION_JSON).content(accept)).andExpect(status().isForbidden());
        mvc.perform(patch("/api/requests/" + reqId + "/cancel").cookie(s2)).andExpect(status().isForbidden());

        // valid transition, then invalid repeat
        mvc.perform(patch(url).cookie(t1).contentType(MediaType.APPLICATION_JSON).content(accept))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ACCEPTED"));
        mvc.perform(patch(url).cookie(t1).contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"REJECTED\"}"))
                .andExpect(status().isConflict());

        // student sees updated status, then cancels
        mvc.perform(get("/api/requests/student/me").cookie(s1)).andExpect(jsonPath("$[0].status").value("ACCEPTED"));
        mvc.perform(get("/api/requests/student/me").cookie(s2)).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(patch("/api/requests/" + reqId + "/cancel").cookie(s1))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}
