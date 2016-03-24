--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.1
-- Dumped by pg_dump version 9.5.0

-- Started on 2016-03-23 20:34:04 PDT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 186 (class 1259 OID 16611)
-- Name: fines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE fines (
    loan_id integer NOT NULL,
    fine_amt numeric DEFAULT 0.00 NOT NULL,
    paid boolean NOT NULL
);


ALTER TABLE fines OWNER TO postgres;

--
-- TOC entry 2397 (class 0 OID 16611)
-- Dependencies: 186
-- Data for Name: fines; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO fines VALUES (661, 0.25, false);
INSERT INTO fines VALUES (637, 0.25, false);
INSERT INTO fines VALUES (632, 0.25, false);
INSERT INTO fines VALUES (643, 0.25, false);
INSERT INTO fines VALUES (2, 0.25, true);
INSERT INTO fines VALUES (6, 0.25, true);
INSERT INTO fines VALUES (25, 0.25, true);
INSERT INTO fines VALUES (31, 0.25, true);
INSERT INTO fines VALUES (34, 0.25, true);
INSERT INTO fines VALUES (46, 0.25, true);
INSERT INTO fines VALUES (58, 0.25, true);
INSERT INTO fines VALUES (59, 0.25, true);
INSERT INTO fines VALUES (65, 0.25, true);
INSERT INTO fines VALUES (71, 0.25, true);
INSERT INTO fines VALUES (87, 0.25, true);
INSERT INTO fines VALUES (89, 0.25, true);
INSERT INTO fines VALUES (93, 0.25, true);
INSERT INTO fines VALUES (98, 0.25, true);
INSERT INTO fines VALUES (114, 0.25, true);
INSERT INTO fines VALUES (130, 0.25, true);
INSERT INTO fines VALUES (133, 0.25, true);
INSERT INTO fines VALUES (136, 0.25, true);
INSERT INTO fines VALUES (152, 0.25, true);
INSERT INTO fines VALUES (159, 0.25, true);
INSERT INTO fines VALUES (168, 0.25, true);
INSERT INTO fines VALUES (175, 0.25, true);
INSERT INTO fines VALUES (184, 0.25, true);
INSERT INTO fines VALUES (188, 0.25, true);
INSERT INTO fines VALUES (189, 0.25, true);
INSERT INTO fines VALUES (198, 0.25, true);
INSERT INTO fines VALUES (224, 0.25, true);
INSERT INTO fines VALUES (233, 0.25, true);
INSERT INTO fines VALUES (248, 0.25, true);
INSERT INTO fines VALUES (269, 0.25, true);
INSERT INTO fines VALUES (273, 0.25, true);
INSERT INTO fines VALUES (283, 0.25, true);
INSERT INTO fines VALUES (297, 0.25, true);
INSERT INTO fines VALUES (311, 0.25, true);
INSERT INTO fines VALUES (312, 0.25, true);
INSERT INTO fines VALUES (322, 0.25, true);
INSERT INTO fines VALUES (335, 0.25, true);
INSERT INTO fines VALUES (339, 0.25, true);
INSERT INTO fines VALUES (351, 0.25, true);
INSERT INTO fines VALUES (361, 0.25, true);
INSERT INTO fines VALUES (365, 0.25, true);
INSERT INTO fines VALUES (366, 0.25, true);
INSERT INTO fines VALUES (375, 0.25, true);
INSERT INTO fines VALUES (394, 0.25, true);
INSERT INTO fines VALUES (397, 0.25, true);
INSERT INTO fines VALUES (398, 0.25, true);
INSERT INTO fines VALUES (399, 0.25, true);
INSERT INTO fines VALUES (401, 0.25, true);
INSERT INTO fines VALUES (405, 0.25, true);
INSERT INTO fines VALUES (406, 0.25, true);
INSERT INTO fines VALUES (409, 0.25, true);
INSERT INTO fines VALUES (410, 0.25, true);
INSERT INTO fines VALUES (414, 0.25, true);
INSERT INTO fines VALUES (416, 0.25, true);
INSERT INTO fines VALUES (431, 0.25, true);
INSERT INTO fines VALUES (437, 0.25, true);
INSERT INTO fines VALUES (439, 0.25, true);
INSERT INTO fines VALUES (441, 0.25, true);
INSERT INTO fines VALUES (455, 0.25, true);
INSERT INTO fines VALUES (478, 0.25, true);
INSERT INTO fines VALUES (479, 0.25, true);
INSERT INTO fines VALUES (481, 0.25, true);
INSERT INTO fines VALUES (497, 0.25, true);
INSERT INTO fines VALUES (507, 0.25, true);
INSERT INTO fines VALUES (537, 0.25, true);
INSERT INTO fines VALUES (544, 0.25, true);
INSERT INTO fines VALUES (564, 0.25, true);
INSERT INTO fines VALUES (572, 0.25, true);
INSERT INTO fines VALUES (580, 0.25, true);
INSERT INTO fines VALUES (591, 0.25, true);
INSERT INTO fines VALUES (596, 0.25, true);
INSERT INTO fines VALUES (600, 0.25, true);
INSERT INTO fines VALUES (608, 0.25, true);
INSERT INTO fines VALUES (611, 0.25, true);
INSERT INTO fines VALUES (708, 2.25, false);


--
-- TOC entry 2281 (class 2606 OID 16616)
-- Name: finespk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fines
    ADD CONSTRAINT finespk PRIMARY KEY (loan_id);


--
-- TOC entry 2282 (class 2606 OID 16768)
-- Name: finesfk_ref_book_loans; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY fines
    ADD CONSTRAINT finesfk_ref_book_loans FOREIGN KEY (loan_id) REFERENCES book_loans(loan_id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2016-03-23 20:34:04 PDT

--
-- PostgreSQL database dump complete
--

