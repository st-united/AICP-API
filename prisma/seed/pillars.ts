import { PrismaClient, CompetencyDimension, CompetencyFramework } from '@prisma/client';

export async function seedPillars(prisma: PrismaClient, competencyFrameworks: CompetencyFramework[]) {
  const competencyFrameworkMap = Object.fromEntries(competencyFrameworks.map((c) => [c.version, c]));

  const competencyPillarDatas = [
    // For general competency
    {
      name: CompetencyDimension.MINDSET,
      description:
        'Psychological and cognitive foundations for AI adoption: ethics, adaptation, innovation mindset, and continuous learning capabilities.',
      weightWithinDimension: 0.4,
      dimension: CompetencyDimension.MINDSET,
      frameworkVersion: '5.0',
    },
    {
      name: CompetencyDimension.SKILLSET,
      description:
        'Applied competencies for AI implementation: problem-solving, critical thinking, collaboration, and project execution skills.',
      weightWithinDimension: 0.35,
      dimension: CompetencyDimension.SKILLSET,
      frameworkVersion: '5.0',
    },
    {
      name: CompetencyDimension.TOOLSET,
      description:
        'Technical proficiency with AI tools, platforms, and implementation methodologies in production environments.',
      weightWithinDimension: 0.25,
      dimension: CompetencyDimension.TOOLSET,
      frameworkVersion: '5.0',
    },
    //For Developer Competency
    // {
    //   name: CompetencyDimension.MINDSET,
    //   description:
    //     'Understanding software development principles, ethical coding practices, adaptability to new technologies, and commitment to continuous learning in IT.',
    //   weightWithinDimension: 0.4,
    //   dimension: CompetencyDimension.MINDSET,
    //   frameworkVersion: '4.0',
    // },
    // {
    //   name: CompetencyDimension.SKILLSET,
    //   description:
    //     'Core programming abilities including algorithm design, data structures, debugging, system architecture, and collaborative development practices.',
    //   weightWithinDimension: 0.35,
    //   dimension: CompetencyDimension.SKILLSET,
    //   frameworkVersion: '4.0',
    // },
    // {
    //   name: CompetencyDimension.TOOLSET,
    //   description:
    //     'Proficiency in programming languages, development frameworks, version control systems, testing tools, and deployment technologies.',
    //   weightWithinDimension: 0.25,
    //   dimension: CompetencyDimension.TOOLSET,
    //   frameworkVersion: '4.0',
    // },
  ];

  // Step 1: Create pillars without frameworkId and weightWithinDimension
  const createdPillars = await Promise.all(
    competencyPillarDatas.map((data) =>
      prisma.competencyPillar.create({
        data: {
          name: data.name,
          description: data.description,
          dimension: data.dimension,
        },
      })
    )
  );

  // Step 2: Create PillarFramework junction records
  await prisma.pillarFramework.createMany({
    data: createdPillars.map((pillar, index) => ({
      pillarId: pillar.id,
      frameworkId: competencyFrameworkMap[competencyPillarDatas[index].frameworkVersion].id,
      weightWithinDimension: competencyPillarDatas[index].weightWithinDimension,
    })),
    skipDuplicates: false,
  });

  return createdPillars;
}
