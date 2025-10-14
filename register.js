console.log("✅ register.js loaded");

/* ========= CONFIG ========= */
const PAYSTACK_PUBLIC_KEY = 'pk_live_46bb3a72aa95a066295cd0231ecd1946fbf83aad'; // public key is safe to expose
const ADMIN_WHATSAPP = '2349161315810';

// Fees (NGN)
const COURSE_FEES_SMARTPHONE = {
  'Graphic Design (Canva, Pixellab)': 30000,
  'Video Animation & Editing (CapCut, Alight Motion, InShot)': 45000,
  'Social Media Management (Facebook, Instagram, TikTok)': 30000,
  'Content Writing (Blogs, Articles, Social Posts)': 30000,
  'Copywriting (Ads, Emails, Product Descriptions)': 30000,
  'Artificial Intelligence (AI-powered productivity)': 40000,
  'Ghostwriting (Books, Blogs, Articles)': 60000,
};
const COURSE_FEES_LAPTOP = {
  'Web Design': 80000, 'Graphics Design': 45000, 'Web Development': 200000,
  'Mobile App Development': 250000, 'Content Writing': 30000, 'Copywriting': 30000,
  'Video Animation & Editing': 50000, 'Social Media Management & Marketing': 30000,
  'Ads Success': 20000, 'Mastering AI': 40000, 'UI/UX Design': 80000,
  'Data Entry': 20000, 'Office Suite / Google Workspace': 25000,
};
const MENTOR_FEES = {
  'Career Mentorship': 60000,
  'Business Mentorship': 120000,
  'IT Mentorship': 80000,
};

// Eligible for installments
const INSTALLMENT_COURSES = ['Web Development', 'Mobile App Development', 'UI/UX Design'];
const INSTALLMENT_MENTOR  = ['Business Mentorship', 'IT Mentorship'];

/* ========= Utils ========= */
const fmtNGN = n => `₦${(n || 0).toLocaleString()}`;
const byId = id => document.getElementById(id);

/* ========= COURSES ========= */
(function courseFlow(){
  const form = byId('courseRegisterForm');
  if (!form) return;

  const deviceSel = byId('cr_device');
  const courseSel = byId('cr_course');
  const startInp  = byId('cr_start');
  const priceDisp = byId('cr_price_display');

  // plan + installments UI
  const planRow   = byId('cr_plan_row');
  const planFull  = byId('cr_plan_full');
  const planInst  = byId('cr_plan_inst');
  const instWrap  = byId('installment-options');
  const instMonths= byId('cr_months');
  const instOut   = byId('cr_installment_breakdown');

  const populateCourses = (mode) => {
    courseSel.innerHTML = '<option value="">Select course…</option>';
    const source = mode === 'smartphone' ? COURSE_FEES_SMARTPHONE : COURSE_FEES_LAPTOP;
    Object.keys(source).forEach(label => {
      const opt = document.createElement('option');
      opt.value = label;
      opt.textContent = label;
      courseSel.appendChild(opt);
    });
    courseSel.disabled = false;
    priceDisp.textContent = '—';

    // reset plan UI
    planRow.hidden = true; planFull.checked = true; planInst.checked = false;
    instWrap.hidden = true; instOut.textContent = ''; instMonths.value = '';
  };

  deviceSel.addEventListener('change', () => {
    const mode = deviceSel.value;
    if (!mode){
      courseSel.innerHTML = '<option value="">Select course…</option>';
      courseSel.disabled = true;
      priceDisp.textContent = '—';
      planRow.hidden = true; instWrap.hidden = true; instOut.textContent = '';
      return;
    }
    populateCourses(mode);
  });

  courseSel.addEventListener('change', () => {
    const map = deviceSel.value === 'smartphone' ? COURSE_FEES_SMARTPHONE : COURSE_FEES_LAPTOP;
    const selected = courseSel.value;
    const price = map[selected];
    priceDisp.textContent = price ? fmtNGN(price) : '—';

    const eligible = INSTALLMENT_COURSES.includes(selected);
    planRow.hidden = !eligible;

    if (!eligible){
      planFull.checked = true; planInst.checked = false;
      instWrap.hidden = true; instOut.textContent = ''; instMonths.value = '';
    }
  });

  [planFull, planInst].forEach(r => {
    r.addEventListener('change', () => {
      if (planInst.checked) instWrap.hidden = false;
      else { instWrap.hidden = true; instOut.textContent=''; instMonths.value=''; }
    });
  });

  instMonths.addEventListener('input', () => {
    const months = parseInt(instMonths.value,10);
    const map = deviceSel.value === 'smartphone' ? COURSE_FEES_SMARTPHONE : COURSE_FEES_LAPTOP;
    const amount = map[courseSel.value];
    if (!months || !amount) { instOut.textContent=''; return; }

    const perMonth = Math.ceil(amount / months);
    let today = new Date();
    const lines = [];
    for (let i=0; i<months; i++){
      const due = new Date(today);
      due.setMonth(today.getMonth() + i);
      lines.push(`${due.toDateString()} — ${fmtNGN(perMonth)}`);
    }
    instOut.textContent = `${fmtNGN(perMonth)} per month for ${months} months.\n` + lines.join('\n');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name  = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const device= deviceSel.value;
    const course= courseSel.value;
    const start = startInp.value || '';

    if (!name || !email || !phone || !device || !course) { alert('Please complete all fields.'); return; }

    const priceMap = device === 'smartphone' ? COURSE_FEES_SMARTPHONE : COURSE_FEES_LAPTOP;
    const amount = priceMap[course];

    // decide full vs installment
    const usingInstallment = !planRow.hidden && planInst.checked;
    const months = parseInt(instMonths.value,10);
    if (usingInstallment && (!months || months < 2)) {
      alert('Enter how many months (minimum 2) to use installment.');
      return;
    }
    const amountToCharge = (usingInstallment) ? Math.ceil(amount / months) : amount;

    const ref = `SOA-C-${Date.now()}-${Math.floor(Math.random()*9999)}`;
    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amountToCharge * 100,  // kobo
      currency: 'NGN',
      ref,
      metadata: {
        custom_fields: [
          {display_name:'Customer Name', variable_name:'customer_name', value:name},
          {display_name:'Phone',         variable_name:'phone',         value:phone},
          {display_name:'Course',        variable_name:'course',        value:course},
          {display_name:'Device',        variable_name:'device',        value:device},
          {display_name:'Plan',          variable_name:'plan',          value: usingInstallment ? `Installment x${months}` : 'Full' },
          {display_name:'Total Price',   variable_name:'total_price',   value: fmtNGN(amount) }
        ]
      },
      callback: (resp) => {
        const msg = [
          `Hello Sulaymaan,`,
          ``,
          `New course enrollment ✅`,
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone}`,
          `Course: ${course} (${device})`,
          `Plan: ${usingInstallment ? `Installment x${months}` : 'Full'}`,
          `Charged Now: ${fmtNGN(amountToCharge)} / Total: ${fmtNGN(amount)}`,
          `Ref: ${resp.reference}`
        ].join('%0A');
        window.location.href = `https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`;
      },
      onClose: () => {}
    });

    handler.openIframe();
  });
})();

/* ========= MENTORSHIP ========= */
(function mentorFlow(){
  const form = byId('mentorshipRegisterForm');
  if (!form) return;

  const trackSel  = byId('mr_track');
  const priceDisp = byId('mr_price_display');

  const planRow   = byId('mr_plan_row');
  const planFull  = byId('mr_plan_full');
  const planInst  = byId('mr_plan_inst');
  const instWrap  = byId('installment-options-mentor');
  const instMonths= byId('mr_months');
  const instOut   = byId('mr_installment_breakdown');

  trackSel.addEventListener('change', () => {
    const selected = trackSel.value;
    const price = MENTOR_FEES[selected];
    priceDisp.textContent = price ? fmtNGN(price) : '—';

    const eligible = INSTALLMENT_MENTOR.includes(selected);
    planRow.hidden = !eligible;

    if (!eligible){
      planFull.checked = true; planInst.checked = false;
      instWrap.hidden = true; instOut.textContent = ''; instMonths.value = '';
    }
  });

  [planFull, planInst].forEach(r=>{
    r.addEventListener('change', ()=>{
      if (planInst.checked) instWrap.hidden = false;
      else { instWrap.hidden = true; instOut.textContent=''; instMonths.value=''; }
    });
  });

  instMonths.addEventListener('input', ()=>{
    const months = parseInt(instMonths.value,10);
    const amount = MENTOR_FEES[trackSel.value];
    if (!months || !amount){ instOut.textContent=''; return; }
    const perMonth = Math.ceil(amount / months);
    let today = new Date();
    const lines = [];
    for (let i=0;i<months;i++){
      const due = new Date(today);
      due.setMonth(today.getMonth() + i);
      lines.push(`${due.toDateString()} — ${fmtNGN(perMonth)}`);
    }
    instOut.textContent = `${fmtNGN(perMonth)} per month for ${months} months.\n` + lines.join('\n');
  });

  form.addEventListener('submit', (e) => e.preventDefault());

  form.addEventListener('submit', () => {
    const name  = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const track = trackSel.value;
    const goal  = byId('mr_goal').value.trim();
    const start = byId('mr_start').value || '';
    const duration = byId('mr_duration').value || '';
    const amount = MENTOR_FEES[track];

    if (!name || !email || !phone || !track || !amount) {
      alert('Please complete all fields.');
      return;
    }

    const usingInstallment = !planRow.hidden && planInst.checked;
    const months = parseInt(instMonths.value,10);
    if (usingInstallment && (!months || months < 2)) {
      alert('Enter how many months (minimum 2) to use installment.');
      return;
    }
    const amountToCharge = (usingInstallment) ? Math.ceil(amount / months) : amount;

    const ref = `SOA-M-${Date.now()}-${Math.floor(Math.random()*9999)}`;
    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amountToCharge * 100,
      currency: 'NGN',
      ref,
      metadata: {
        custom_fields: [
          {display_name:'Customer Name', variable_name:'customer_name', value:name},
          {display_name:'Phone',         variable_name:'phone',         value:phone},
          {display_name:'Track',         variable_name:'track',         value:track},
          {display_name:'Plan',          variable_name:'plan',          value: usingInstallment ? `Installment x${months}` : 'Full' },
          {display_name:'Total Price',   variable_name:'total_price',   value: fmtNGN(amount) }
        ]
      },
      callback: (resp) => {
        const msg = [
          `Hello Sulaymaan,`,
          ``,
          `New mentorship application ✅`,
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone}`,
          `Track: ${track}`,
          `Plan: ${usingInstallment ? `Installment x${months}` : 'Full'}`,
          `Charged Now: ${fmtNGN(amountToCharge)} / Total: ${fmtNGN(amount)}`,
          `Ref: ${resp.reference}`
        ].join('%0A');
        window.location.href = `https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`;
      },
      onClose: () => {}
    });

    handler.openIframe();
  });
})();
