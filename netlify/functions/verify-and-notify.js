// netlify/functions/verify-and-notify.js
export default async (req, context) => {
  try{
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({error:'Method not allowed'}), {status:405});
    }

    const {
      type, reference, // common
      name, email, phone,
      // course flow
      course, device, start,
      // mentorship flow
      track, goal, duration,
      amount
    } = await req.json();

    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    const RESEND_API_KEY  = process.env.RESEND_API_KEY;
    const ADMIN_EMAIL     = process.env.ADMIN_EMAIL || 'you@example.com';
    const SITE_NAME       = 'Sulaymaan O. Abubakr';

    // 1) Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });
    const verifyJson = await verifyRes.json();

    if (!verifyRes.ok || verifyJson.status !== true || verifyJson.data.status !== 'success') {
      return new Response(JSON.stringify({error:'Verification failed', details: verifyJson}), {status:400});
    }

    // 2) Build email content
    const isCourse = type === 'course';
    const subjectUser = isCourse
      ? `Welcome to ${course} — Payment Received`
      : `Welcome to ${track} — Payment Received`;

    const subjectAdmin = isCourse
      ? `New Enrollment: ${name} — ${course}`
      : `New Mentorship: ${name} — ${track}`;

    const summaryLines = isCourse
      ? [
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone}`,
          `Course: ${course}`,
          `Device: ${device}`,
          `Preferred Start: ${start || '-'}`,
          `Amount: ₦${(amount||0).toLocaleString()}`,
          `Reference: ${reference}`,
        ]
      : [
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone}`,
          `Track: ${track}`,
          `Goal: ${goal || '-'}`,
          `Preferred Start: ${start || '-'}`,
          `Duration: ${duration || '-'}`,
          `Amount: ₦${(amount||0).toLocaleString()}`,
          `Reference: ${reference}`,
        ];

    const userBody = [
      `Hi ${name},`,
      ``,
      `Your payment was received successfully. Below are your details:`,
      ...summaryLines,
      ``,
      `We’ll reach out shortly on WhatsApp with onboarding information.`,
      ``,
      `— ${SITE_NAME}`
    ].join('\n');

    const adminBody = [
      `New ${isCourse ? 'Course Enrollment' : 'Mentorship Application'}:`,
      ...summaryLines
    ].join('\n');

    // 3) Send emails (Resend)
    const sendEmail = async (to, subject, text) => {
      const r = await fetch('https://api.resend.com/emails', {
        method:'POST',
        headers:{
          'Authorization':`Bearer ${RESEND_API_KEY}`,
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
          from: `SOA <no-reply@sulaymaan.name.ng>`,
          to:[to],
          subject,
          text
        })
      });
      if (!r.ok) {
        const t = await r.text();
        console.error('Resend error:', t);
      }
    };

    await Promise.all([
      sendEmail(email, subjectUser, userBody),
      sendEmail(ADMIN_EMAIL, subjectAdmin, adminBody)
    ]);

    // 4) Respond to frontend
    return new Response(JSON.stringify({ok:true}), {status:200});
  }catch(err){
    console.error(err);
    return new Response(JSON.stringify({error:'Server error'}), {status:500});
  }
};