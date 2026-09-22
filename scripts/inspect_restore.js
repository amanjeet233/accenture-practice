const fs = require('fs');
const data = JSON.parse(fs.readFileSync('prisma/exported_data.json', 'utf8'));

const nonMcqQuestions = data.questions.filter((q) => q.questionType !== 'MCQ');
const nonMcqIds = new Set(nonMcqQuestions.map((q) => q.id));

console.log('Non-MCQ questions count:', nonMcqQuestions.length);

const relatedTopics = (data.questionTopics || []).filter((qt) => nonMcqIds.has(qt.questionId));
console.log('Related questionTopics:', relatedTopics.length);

const relatedCompanies = (data.questionCompanies || []).filter((qc) => nonMcqIds.has(qc.questionId));
console.log('Related questionCompanies:', relatedCompanies.length);

const relatedExamples = (data.questionExamples || []).filter((qe) => nonMcqIds.has(qe.questionId));
console.log('Related questionExamples:', relatedExamples.length);

const relatedTestCases = (data.questionTestCases || []).filter((qtc) => nonMcqIds.has(qtc.questionId));
console.log('Related questionTestCases:', relatedTestCases.length);

const relatedHints = (data.questionHints || []).filter((qh) => nonMcqIds.has(qh.questionId));
console.log('Related questionHints:', relatedHints.length);

const relatedSolutions = (data.questionSolutions || []).filter((qs) => nonMcqIds.has(qs.questionId));
console.log('Related questionSolutions:', relatedSolutions.length);

console.log('MockTests count:', (data.mockTests || []).length);
console.log('MockTestQuestions count:', (data.mockTestQuestions || []).length);
