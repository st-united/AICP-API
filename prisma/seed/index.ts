import { PrismaClient } from '@prisma/client';
import { seedPermissions } from './permissions';
import { seedRoles } from './roles';
import { seedRolePermissions } from './rolePermissions';
import { seedUsers } from './users';
import { seedDomains } from './domains';
import { seedCompetencyFrameworks } from './competencyFrameworks';
import { seedPillars } from './pillars';
import { seedAspects } from './aspects';
import { seedLevels } from './levels';
import { seedCompetencySkills } from './competencySkills';
import { seedQuestions } from './questions';
import { seedCourses } from './courses';
import { seedExamSets } from './examSets';
import { seedExams } from './exams';
import { seedMentors } from './mentors';
import { seedMentorBookings } from './mentorBookings';
import { seedUserAnswers } from './userAnswers';
import { seedExamLevels } from './examlevel';
import { seedInterviewRequest } from './interviewRequest';
import { seedAssessmentMethods } from './assessmentMethods';
import { seedCompetencyAspectAssessmentMethod } from './competencyAspectAssessmentMethod';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // 1. Permissions
  seedPermissions(prisma);
  const permissions = await prisma.permission.findMany();

  // 2. Roles
  await seedRoles(prisma);
  const roles = await prisma.role.findMany();

  // 3. Exam Levels
  await seedExamLevels(prisma);
  const examLevels = await prisma.examLevel.findMany();

  // 4. Role Permissions
  await seedRolePermissions(prisma, roles, permissions);

  // 5. Domains (moved before users)
  await seedDomains(prisma);
  const domains = await prisma.domain.findMany();

  // 6. Users (now with domains)
  const userMap = await seedUsers(prisma, roles, domains);

  // 7. Competency Frameworks
  await seedCompetencyFrameworks(prisma, domains);
  const competencyFrameworks = await prisma.competencyFramework.findMany();

  // 8. Competency Pillars
  await seedPillars(prisma, competencyFrameworks);
  const pillars = await prisma.competencyPillar.findMany({
    include: {
      aspects: true,
    },
  });

  // 9. Aspects
  await seedAspects(prisma, pillars);
  const aspects = await prisma.competencyAspect.findMany();

  // 10. Levels
  await seedLevels(prisma);
  const levels = await prisma.level.findMany();

  // 11. Competency Skills
  await seedCompetencySkills(prisma, aspects);
  const competencySkills = await prisma.competencySkill.findMany();

  // 12. Questions
  await seedQuestions(prisma, levels, competencySkills);
  const questions = await prisma.question.findMany();

  // 13. Courses
  await seedCourses(prisma, aspects, domains);

  // 14. Assessment Methods
  await seedAssessmentMethods(prisma);
  const assessmentMethods = await prisma.assessmentMethod.findMany();

  await prisma.assessmentMethod.findMany();
  // 14.5 Competency Aspect Assessment Method
  await seedCompetencyAspectAssessmentMethod(prisma, aspects, assessmentMethods);

  // 15. Exam Sets
  await seedExamSets(prisma, questions, competencyFrameworks, assessmentMethods);
  const examSets = await prisma.examSet.findMany();

  // 16. Exams
  const exams = await seedExams(prisma, userMap, examSets, examLevels, pillars, aspects);
  const allExams = await prisma.exam.findMany();
  const examMap = Object.fromEntries(allExams.map((exam) => [exam.userId, { id: exam.id }]));

  // 17. Mentors
  await seedMentors(prisma, userMap);
  const mentors = await prisma.mentor.findMany({
    include: {
      user: true,
    },
  });

  // 18. Mentor Bookings
  await seedMentorBookings(prisma, userMap, examMap, mentors);

  // 19. User Answers
  await seedUserAnswers(prisma, userMap, questions, exams);

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error('_-_-_-_-_-_-_-_-_❌ Seeding failed_-_-_-_-_-_-_-_-_\n', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
