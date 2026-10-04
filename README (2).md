# INDIA 2027 – The Blue Army Squad Lab
Ready-made Vite project (the files here already include everything).
1. `cd india-2027-squad && npm install`
2. Email: create a service + template on emailjs.com (template "To" = `{{to_email}}`; use `{{subject}}`, `{{message}}`). Paste service_id, template_id, public key into `src/utils/emailService.js`.
3. Recipient is `TO_EMAIL` in that same file (set to office@bcci.tv; change it to motlubahmed496@gmail.com for testing).
4. `npm run dev` → http://localhost:5173
2. Email: squads are submitted through Netlify Forms (form `squad-submission`). In the Netlify UI go to Project configuration > Notifications > Emails and webhooks > Form submission notifications and add the address that should receive each squad. Submissions also appear under the Forms tab. (Forms only work on a Netlify deploy or `netlify dev`.)
3. `npm run dev` → http://localhost:5173
Add real avg / SR / economy per player in `src/data/players.js`.