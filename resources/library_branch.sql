--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.1
-- Dumped by pg_dump version 9.5.0

-- Started on 2016-03-23 20:34:21 PDT

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
-- TOC entry 182 (class 1259 OID 16440)
-- Name: library_branch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE library_branch (
    branch_id integer NOT NULL,
    branch_name text NOT NULL,
    address text NOT NULL
);


ALTER TABLE library_branch OWNER TO postgres;

--
-- TOC entry 2395 (class 0 OID 16440)
-- Dependencies: 182
-- Data for Name: library_branch; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO library_branch VALUES (1, 'Oak Lawn', '4100 Cedar Springs Road, 75219');
INSERT INTO library_branch VALUES (2, 'Lakewood', '6121 Worth Street, 75214');
INSERT INTO library_branch VALUES (3, 'Grauwyler Park', '2146 Gilford Street, 75235');
INSERT INTO library_branch VALUES (4, 'Highland Hills', '3624 Simpson Stuart Road, 75241');
INSERT INTO library_branch VALUES (5, 'Audelia Road', '10045 Audelia Road, 75238');


--
-- TOC entry 2280 (class 2606 OID 16447)
-- Name: branch_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY library_branch
    ADD CONSTRAINT branch_id PRIMARY KEY (branch_id);


-- Completed on 2016-03-23 20:34:21 PDT

--
-- PostgreSQL database dump complete
--

