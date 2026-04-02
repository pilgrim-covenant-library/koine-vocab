import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const INSTRUCTOR_EMAIL = 'keratinqw@gmail.com';

// Force dynamic to avoid build-time evaluation
export const dynamic = 'force-dynamic';

interface TranslationAnswer {
  questionId: string;
  reference: string;
  greek: string;
  referenceTranslation: string;
  studentTranslation: string;
}

interface MCQAnswerDetail {
  questionId: string;
  question: string;
  options: string[];
  correctIndex: number;
  studentAnswer: number; // -1 if unanswered
  isCorrect: boolean;
}

interface MCQSectionAnswers {
  sectionId: number;
  questions: MCQAnswerDetail[];
}

interface ExamResultsPayload {
  studentName: string;
  studentEmail: string;
  grammarScore: number;
  grammarTotal: number;
  vocabScore: number;
  vocabTotal: number;
  translationScore: number;
  translationTotal: number;
  translationAnswers: TranslationAnswer[];
  mcqAnswers?: MCQSectionAnswers[];
  completedAt: string;
}

function buildEmailHtml(data: ExamResultsPayload): string {
  const grammarPct = Math.round((data.grammarScore / data.grammarTotal) * 100);
  const vocabPct = Math.round((data.vocabScore / data.vocabTotal) * 100);
  const translationPct = data.translationTotal > 0 ? Math.round((data.translationScore / data.translationTotal) * 100) : 0;
  const overallTotal = data.grammarScore + data.vocabScore + data.translationScore;
  const overallPossible = data.grammarTotal + data.vocabTotal + data.translationTotal;
  const overallPct = Math.round((overallTotal / overallPossible) * 100);

  // Build MCQ answer rows for sections 1 & 2
  const mcqSections = (data.mcqAnswers || [])
    .map((section) => {
      const sectionName = section.sectionId === 1 ? 'Section 1: Grammar Understanding' : 'Section 2: Vocabulary';
      const correct = section.questions.filter((q) => q.isCorrect).length;
      const rows = section.questions
        .map((q, i) => {
          const unanswered = q.studentAnswer === -1;
          const studentChoice = unanswered ? '(no answer)' : q.options[q.studentAnswer] || '(invalid)';
          const correctChoice = q.options[q.correctIndex];
          const icon = q.isCorrect ? '&#9989;' : unanswered ? '&#11036;' : '&#10060;';
          const bgColor = q.isCorrect ? '#f0fdf4' : unanswered ? '#fefce8' : '#fef2f2';
          return `
          <tr style="background: ${bgColor}; border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 10px; vertical-align: top; width: 30px; font-size: 13px; color: #6b7280;">${i + 1}</td>
            <td style="padding: 8px 10px; vertical-align: top; font-size: 13px;">
              <div style="font-weight: 500; color: #374151; margin-bottom: 4px;">${q.question}</div>
              <div>
                ${icon} <strong>Student:</strong> ${unanswered ? '<span style="color: #d97706;">(skipped)</span>' : studentChoice}
                ${!q.isCorrect && !unanswered ? ` &nbsp;|&nbsp; <strong>Correct:</strong> <span style="color: #059669;">${correctChoice}</span>` : ''}
                ${unanswered ? ` &nbsp;|&nbsp; <strong>Correct:</strong> <span style="color: #059669;">${correctChoice}</span>` : ''}
              </div>
            </td>
          </tr>`;
        })
        .join('');

      return `
      <h2 style="font-size: 18px; margin-top: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
        ${sectionName} — ${correct}/${section.questions.length}
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>${rows}</tbody>
      </table>`;
    })
    .join('');

  const translationRows = data.translationAnswers
    .map(
      (a, i) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; vertical-align: top; width: 30px; color: #6b7280; font-size: 14px;">${i + 1}</td>
        <td style="padding: 12px; vertical-align: top;">
          <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">${a.reference}</div>
          <div style="font-family: 'Times New Roman', serif; font-size: 16px; color: #1f2937; margin-bottom: 8px;">${a.greek}</div>
          <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;"><em>Reference: ${a.referenceTranslation}</em></div>
          <div style="background: #f3f4f6; border-radius: 6px; padding: 10px; font-size: 14px; color: #1f2937;">
            <strong>Student:</strong> ${a.studentTranslation || '<span style="color: #ef4444;">(no answer)</span>'}
          </div>
        </td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; color: #1f2937;">
  <h1 style="font-size: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 12px;">
    Final Exam Submission
  </h1>

  <table style="width: 100%; margin-bottom: 24px;">
    <tr>
      <td style="color: #6b7280; padding: 4px 0;">Student:</td>
      <td style="font-weight: 600;">${data.studentName || 'Unknown'}</td>
    </tr>
    <tr>
      <td style="color: #6b7280; padding: 4px 0;">Email:</td>
      <td>${data.studentEmail || 'Not provided'}</td>
    </tr>
    <tr>
      <td style="color: #6b7280; padding: 4px 0;">Submitted:</td>
      <td>${data.completedAt}</td>
    </tr>
  </table>

  <h2 style="font-size: 18px; margin-top: 32px;">Exam Results</h2>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <thead>
      <tr style="background: #f3f4f6;">
        <th style="text-align: left; padding: 10px; font-size: 14px;">Section</th>
        <th style="text-align: center; padding: 10px; font-size: 14px;">Score</th>
        <th style="text-align: center; padding: 10px; font-size: 14px;">Percentage</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px;">1. Grammar Understanding</td>
        <td style="text-align: center; padding: 10px; font-weight: 600;">${data.grammarScore} / ${data.grammarTotal}</td>
        <td style="text-align: center; padding: 10px; font-weight: 600; color: ${grammarPct >= 70 ? '#059669' : '#dc2626'};">${grammarPct}%</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px;">2. Vocabulary</td>
        <td style="text-align: center; padding: 10px; font-weight: 600;">${data.vocabScore} / ${data.vocabTotal}</td>
        <td style="text-align: center; padding: 10px; font-weight: 600; color: ${vocabPct >= 70 ? '#059669' : '#dc2626'};">${vocabPct}%</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px;">3. Verse Translation</td>
        <td style="text-align: center; padding: 10px; font-weight: 600;">${data.translationScore} / ${data.translationTotal}</td>
        <td style="text-align: center; padding: 10px; font-weight: 600; color: ${translationPct >= 70 ? '#059669' : '#dc2626'};">${translationPct}%</td>
      </tr>
      <tr style="background: #f9fafb;">
        <td style="padding: 10px; font-weight: 600;">Total</td>
        <td style="text-align: center; padding: 10px; font-weight: 600;">${overallTotal} / ${overallPossible}</td>
        <td style="text-align: center; padding: 10px; font-weight: 600; color: ${overallPct >= 70 ? '#059669' : '#dc2626'};">${overallPct}%</td>
      </tr>
    </tbody>
  </table>

  ${mcqSections}

  <h2 style="font-size: 18px; margin-top: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
    Section 3: Verse Translation Details
  </h2>
  <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
    ${data.translationAnswers.length} translation answers below. Each shows the Greek text, reference translation, and the student's answer.
  </p>

  <table style="width: 100%; border-collapse: collapse;">
    <tbody>
      ${translationRows}
    </tbody>
  </table>

  <div style="margin-top: 32px; padding: 16px; background: #eff6ff; border-radius: 8px; font-size: 13px; color: #1e40af;">
    This email was sent automatically by the Koine Greek Vocab app when the student completed their final exam.
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExamResultsPayload;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Koine Vocab <onboarding@resend.dev>',
      to: INSTRUCTOR_EMAIL,
      subject: `Final Exam: ${body.studentName || 'Student'} — ${Math.round(((body.grammarScore + body.vocabScore + body.translationScore) / (body.grammarTotal + body.vocabTotal + body.translationTotal)) * 100)}%`,
      html: buildEmailHtml(body),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (err) {
    console.error('Email send failed:', err);
    return NextResponse.json(
      { error: 'Failed to send exam results' },
      { status: 500 }
    );
  }
}
