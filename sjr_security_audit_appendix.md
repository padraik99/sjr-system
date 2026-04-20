## Appendix — Security audit start-of-window prompt

Paste the block below as your first message in a new Cowork / Claude window
when you're ready to audit the sjr-system app's security posture.

---

> **Project: sjr-system — security audit**
>
> Before responding to anything else, do the following in order:
>
> 1. Read `CLAUDE.md` end to end.
> 2. List every `.html` file in the repo. Read each one in full before proceeding.
> 3. Produce a security audit report covering **all** of the following across
>    **every HTML file**:
>
>    **A. Output rendering**
>    - Grep for every `innerHTML`, `outerHTML`, and `document.write` call in all files.
>    - Flag any that write user-supplied data or data read from localStorage / sessionStorage.
>    - Confirm or deny: all user/stored data renders via `textContent` only.
>    - Note which file and which function each violation lives in.
>
>    **B. Input handling**
>    - Identify every place user input enters any file (form fields, file upload,
>      date pickers, sliders, free-text, voice, etc.).
>    - Flag any input that reaches a DOM render, localStorage write, or API call
>      without validation or sanitization.
>
>    **C. Data at rest (localStorage / sessionStorage)**
>    - List every key each file reads or writes.
>    - Cross-reference keys shared across files — these are the highest-risk paths
>      because a vulnerability in one file can corrupt or expose data used by another.
>    - Flag any key containing health data, pain scores, identifiers, or timestamps
>      tied to a person. Health data warrants extra protection even in local-only apps.
>    - Note that any browser extension with DOM access can read all of these keys.
>
>    **D. API and network calls**
>    - List every `fetch` / `XMLHttpRequest` call across all files: endpoint, method,
>      payload.
>    - Flag any call that sends health or personal data.
>    - Flag any API key stored client-side and its exposure surface.
>    - If no network calls exist, confirm explicitly.
>
>    **E. Content Security Policy**
>    - Check each file for a CSP meta tag.
>    - If absent, note what a missing CSP enables (external script injection, data
>      exfiltration via injected fetch, etc.).
>    - If present, evaluate adequacy.
>
>    **F. Health data sensitivity** *(specific to this app)*
>    - This app stores personal health / pain / activity metrics tied to real people.
>    - Flag any path by which that data could leave the device unintentionally:
>      shared file URLs, exported files, third-party scripts, injected payloads.
>    - Flag any data export feature and assess whether exported files could expose
>      keys or tokens alongside health data.
>    - Note whether data is stored in plaintext (it is — localStorage is always
>      plaintext) and whether that risk is documented anywhere.
>
>    **G. Cross-file attack surface**
>    - Because this is a multi-file app sharing a localStorage namespace, a
>      prompt-injection or XSS in *any* file can read or overwrite data used by
>      *all* files. Flag this explicitly if any file lacks CSP or has innerHTML
>      violations.
>
> 4. Produce a **prioritized remediation checklist** — one entry per finding,
>    tagged **Critical / High / Medium / Low** — covering all files. Use this format:
>    ```
>    - [ ] [CRITICAL] filename.html — renderLog() writes log entries via innerHTML (line ~NNN)
>    - [ ] [HIGH] all files — no CSP meta tag
>    ```
> 5. Then wait for instructions. Do not begin making changes until asked.
>
> Rules for the rest of this window:
> - Any fix must be matched by a changelog entry in `CLAUDE.md` and a checklist update.
> - User/stored data must render via `textContent`, never `innerHTML`.
> - Default to zero-dependency, free solutions.
> - Flag any deviation from these rules before proceeding.

---

*Appended to CLAUDE.md from studylab security session — 2026-04-16*
