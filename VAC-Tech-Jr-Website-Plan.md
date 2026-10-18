# VAC Tech Jr Website

**Official website and member platform for VAC Tech Jr, the IT Club of Vishwa Adarsha Academy (+2)**

---

## 1. What is this project?

VAC Tech Jr is the IT club of Vishwa Adarsha Academy's +2 section. This project is a website for the club. It will:

- Introduce the club to students, teachers, and visitors
- Show our events, workshops, notices, and photos
- Showcase the projects that our members build
- Help the club team manage members, registrations, and updates in one place

Think of it as the **digital home of the club**.

---

## 2. Why do we need it?

| Problem today | How the website helps |
|---|---|
| Notices and updates get lost in chats | One official place for all notices |
| Registrations are collected on paper or random forms | Online registration with a proper list |
| Member work is never shown to anyone | A project gallery with the member's name, class, and GitHub link |
| Hard to know who is active | A contributors ranking motivates members |
| No record of past events | An archive of past events and workshops |

---

## 3. Who will use it?

| User | Description | What they can do |
|---|---|---|
| **Visitor** | Anyone who opens the site | Read the public pages, apply for membership, register for events |
| **Member** | Club members (about 50-60 students) | Log in, upload projects, send suggestions |
| **Manager** | The web manager of the club | Manage website content and approve member uploads |
| **Admin** | The Club President | Everything the manager can, plus create member accounts and send emails |
| **Super Admin** | A staff member of the institution | Full control, including adding or removing admins and managers |

The Super Admin is someone from the institution who stays long-term, so the website keeps running even after student leaders graduate.

---

## 4. Features

### 4.1 Public pages (no login needed)

- **Home:** Introduction to the club, its goals, and highlights
- **Notices:** Latest announcements from the club
- **Events:** Upcoming events and workshops, plus an archive of past ones
- **BOD Showcase:** Photos and posts of the current Board of Directors
- **Photo Gallery:** Pictures from events and activities
- **Member Projects:** Things built by our students, with student name, class, section, and GitHub link (only approved projects appear)
- **Top Contributors:** Ranking of the most active members
- **Member List:** Name, class, and GitHub of club members
- **Membership Registration:** Open only for a short period, then closes automatically
- **Event Registration:** Students can register for an upcoming event
- **Contact:** How to reach the club

### 4.2 Member area (login with ID and password)

- Log in with the **ID and password given by the club team** (there is no public sign-up)
- Change the password on first login
- Upload projects with a title, description, image, and GitHub link
- See whether an upload is **pending, approved, or rejected**
- Edit or delete their own uploads
- Send ideas or complaints through the **Suggestion Box**

### 4.3 Admin and Manager panel

- Add, edit, and delete **notices, events, BOD members, and gallery photos**
- Build **event registration forms from a template**: choose which questions to ask and set when registration opens and closes
- View and download **registrations and membership applications**
- Create **member accounts**, one by one or from a spreadsheet (CSV)
- Reset passwords or deactivate accounts
- **Approve or reject** member uploads
- Give **points** to members for the contributors ranking
- Read **suggestions**
- **Send emails**
- Open or close the **membership registration window**

### 4.4 Super Admin extras

- Add or remove Admins and Managers
- Control system-wide settings

---

## 5. How it works (simple flow)

**Membership**
1. The club opens the registration window.
2. Students fill in the membership form.
3. The team reviews applications.
4. Approved members receive an ID and password from the team.
5. Members log in and start uploading their work.

**Uploading a project**
1. The member logs in and uploads a project.
2. It is saved as **pending** and nobody else can see it.
3. A manager or admin reviews it.
4. If approved, it appears in the public Projects gallery.

**Event registration**
1. The admin creates an event and picks the registration form fields.
2. Students register while the form is open.
3. After it closes, the team downloads the list.

---

## 6. Safety and privacy

- **No public sign-up.** Only accounts created by the team can log in.
- **Everything is reviewed.** Uploads go live only after approval.
- **Security is enforced in the database,** not only on the screen, so nobody can bypass it by editing the page.
- **Minimal personal data.** Publicly we show only name, class, and GitHub. No phone numbers or private details.
- **Passwords are stored safely** by the login system and are never visible to anyone, including admins.
- **Role-based access.** Each role can only do what it is meant to do.

---

## 7. Technology

| Part | Tool | Why |
|---|---|---|
| Website (frontend) | React + Tailwind CSS | Modern, fast, mobile friendly |
| Database, login, file storage | Supabase | All-in-one, secure, free plan is enough for our size |
| Email sending | Resend or Brevo | Free plans available |
| Hosting | Vercel | Free and easy to deploy |

There is no custom server to maintain, which makes it easier for future committees to look after.

---

## 8. Development plan

| Phase | What gets built | Time |
|---|---|---|
| 1 | Setup, design, database, login and roles | 1 week |
| 2 | Public website pages | 1-2 weeks |
| 3 | Admin and manager panel | 1-2 weeks |
| 4 | Registrations (membership window, event forms, export) | 1-2 weeks |
| 5 | Member features (accounts, project uploads, approval, ranking) | 2 weeks |
| 6 | Suggestion box, emails, polish | 1 week |
| 7 | Testing with a few students, fixes, launch, handover guide | 1 week |

**Total: about 8-10 weeks.** The public site can go live early, after phase 2, while the rest is being built.

---

## 9. Handover plan

To make sure the website outlives the current team:

- Host everything under an **official club account**, not a personal one
- Write a **short guide** on how to add notices and events and create accounts
- The **Super Admin** can always add new admins, so no code changes are needed when leadership changes
- Keep the design and tools simple

---

## 10. Decisions still to be made

- [ ] How members log in: by ID only, or by real email
- [ ] How membership applications turn into accounts
- [ ] Whether the suggestion box is anonymous or shows names
- [ ] How the ranking is calculated (manual points only, or more factors)
- [ ] Website address: free address, custom domain, or a college subdomain
- [ ] Who will be the Super Admin from the institution
- [ ] Permission to show student names, photos, and work publicly

---

## 11. Summary

The VAC Tech Jr website will be a **public showcase** and a **small management system** for the club. It is simple enough to maintain, secure enough for students, and built in phases so we get something useful online quickly.

*Prepared by the President, VAC Tech Jr, Vishwa Adarsha Academy*
