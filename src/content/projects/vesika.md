---
title: Vesika
description: An AI assistant for lawyers in Türkiye that finds case law, drafts petitions and checks every citation against the real decision.
year: 2025
company: Wite
role: Project lead
links:
  website: https://vesika.ai
detail: true
impact: 4
highlights:
  - value: 11.5M+
    label: decisions and laws, in full text
  - value: 126
    label: courts, boards and other sources
icon:
  src: ./vesika/icon.png
gallery:
  - src: ./vesika/assistant.png
    alt: An answer in Turkish about the statute of limitations in tort, with numbered citations and a list of four sources, next to article 72 of the Turkish Code of Obligations open in a side panel.
    caption: An answer with its sources, and the cited article open beside it.
  - src: ./vesika/legislation.png
    alt: The Turkish Code of Obligations in the source reader, with its sections listed on the left and the search term “zamanaşım” highlighted throughout the text.
    caption: The legislation reader, searching inside a law.
  - src: ./vesika/decision.png
    alt: A decision of the Court of Cassation's General Assembly of Civil Chambers in the source reader, with its docket number, decision number and date, a citation to copy, a button to jump to the ruling, and numbered paragraphs.
    caption: The decision reader, with the full citation one click away.
---

Vesika is an AI assistant for lawyers, built for Turkish law. You describe a case in your own words, and it finds the decisions and legislation that apply, drafts a petition or a contract around them, or reviews a document you upload. Every citation is matched against the real decision before the answer reaches you, and one that doesn't match never makes it into the answer.

We build it at Wite, and I lead the project. The app is in Turkish.

## The assistant

- **Research.** Search by what a case means, not by its keywords. The archive holds more than 11.5 million decisions and laws in full text, from 126 sources: the Court of Cassation, the Council of State, the Constitutional Court, regulatory boards, the Court of Accounts and legislation. You can add your own files and work in the context of a case.
- **Citations.** Each one is checked against the decision's docket number, decision number, chamber and date. Click it to read the reasoning yourself.
- **Readers.** Laws and decisions open in a reader with their sections, search inside the text, a citation to copy and a PDF export.
- **Drafting.** Petitions, contracts and formal notices, written with the relevant precedent. The competent court, the deadline, court fees and attorney fees are checked in the same place.
- **Review.** Upload a contract, the other side's petition or a notice, and missing elements and risky clauses are listed with the reasoning.
- **Formats.** UDF for UYAP, Türkiye's court filing system, and Word or PDF for clients, with the firm's letterhead set up once.

Pulling case files from UYAP and court notices from UETS, the national e-notification system, is coming next.

## Cloud or on premises

Most lawyers start in the cloud, where an account opens the same day. Large firms and companies can run the assistant, the database and the model on their own servers, so documents stay in-house, and sign in through LDAP, Active Directory or SAML SSO. Other software, like Copilot or case and contract management tools, can call Vesika over MCP.

## How it got here

Vesika started in September 2025 as a tool for a law firm's own documents. You signed in with Microsoft, picked folders from OneDrive, and built tables whose columns an AI filled in from every file, like the position and start date in each employment contract. A chat answered questions from the files and tables you selected. Over the next months it gained semantic and hybrid search, shared workspaces for teams, and previews of UDF files. In 2026 it grew into the research assistant it is now, built on its own archive of Turkish decisions and legislation.
