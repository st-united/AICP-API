import { PrismaClient, CompetencyDimension, CompetencyFramework } from '@prisma/client';

export async function seedPillars(prisma: PrismaClient, competencyFrameworks: CompetencyFramework[]) {
  const competencyFrameworkMap = Object.fromEntries(competencyFrameworks.map((c) => [c.version, c]));

  const competencyPillarDatas = [
    // For general competency
    {
      name: CompetencyDimension.MINDSET,
      description:
        'Psychological and cognitive foundations for AI adoption: ethics, adaptation, innovation mindset, and continuous learning capabilities.',
      weightWithinDimension: 0.55,
      dimension: CompetencyDimension.MINDSET,
      frameworkId: competencyFrameworkMap['5.0'].id,
    },
    {
      name: CompetencyDimension.SKILLSET,
      description:
        'Applied competencies for AI implementation: problem-solving, critical thinking, collaboration, and project execution skills.',
      weightWithinDimension: 0.3,
      dimension: CompetencyDimension.SKILLSET,
      frameworkId: competencyFrameworkMap['5.0'].id,
    },
    {
      name: CompetencyDimension.TOOLSET,
      description:
        'Technical proficiency with AI tools, platforms, and implementation methodologies in production environments.',
      weightWithinDimension: 0.15,
      dimension: CompetencyDimension.TOOLSET,
      frameworkId: competencyFrameworkMap['5.0'].id,
    },
    //For Developer Competency
    // {
    //   name: CompetencyDimension.MINDSET,
    //   description:
    //     'Understanding software development principles, ethical coding practices, adaptability to new technologies, and commitment to continuous learning in IT.',
    //   weightWithinDimension: 0.4,
    //   dimension: CompetencyDimension.MINDSET,
    //   frameworkId: competencyFrameworkMap['4.0'].id,
    // },
    // {
    //   name: CompetencyDimension.SKILLSET,
    //   description:
    //     'Core programming abilities including algorithm design, data structures, debugging, system architecture, and collaborative development practices.',
    //   weightWithinDimension: 0.35,
    //   dimension: CompetencyDimension.SKILLSET,
    //   frameworkId: competencyFrameworkMap['4.0'].id,
    // },
    // {
    //   name: CompetencyDimension.TOOLSET,
    //   description:
    //     'Proficiency in programming languages, development frameworks, version control systems, testing tools, and deployment technologies.',
    //   weightWithinDimension: 0.25,
    //   dimension: CompetencyDimension.TOOLSET,
    //   frameworkId: competencyFrameworkMap['4.0'].id,
    // },
  ];

  await prisma.competencyPillar.createMany({
    data: competencyPillarDatas,
    skipDuplicates: false,
  });
}
