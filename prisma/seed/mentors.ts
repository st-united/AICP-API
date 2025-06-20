import { PrismaClient, SFIALevel } from '@prisma/client';

export async function seedMentors(prisma: PrismaClient, userMap: { [email: string]: { id: string } }) {
  const mentorsData = [
    {
      email: 'mentor1@example.com',
      expertise: 'Machine Learning, Deep Learning, Computer Vision',
    },
    {
      email: 'mentor2@example.com',
      expertise: 'Natural Language Processing, Transformers, BERT',
    },
    {
      email: 'mentor3@example.com',
      expertise: 'Reinforcement Learning, Game AI, Decision Making',
    },
    {
      email: 'mentor4@example.com',
      expertise: 'Data Science, Statistical Analysis, Big Data',
    },
    {
      email: 'mentor5@example.com',
      expertise: 'AI Ethics, Responsible AI Development, Fairness',
    },
    {
      email: 'mentor6@example.com',
      expertise: 'Robotics, Computer Vision, Sensor Fusion',
    },
    {
      email: 'mentor7@example.com',
      expertise: 'MLOps, AI Infrastructure, Model Deployment',
    },
    {
      email: 'mentor8@example.com',
      expertise: 'AI in Healthcare, Medical Imaging, Bioinformatics',
    },
    {
      email: 'mentor9@example.com',
      expertise: 'AI for Finance, Quantitative Analysis, Risk Assessment',
    },
    {
      email: 'mentor10@example.com',
      expertise: 'Edge AI, IoT, Embedded Systems',
    },
    {
      email: 'mentor11@example.com',
      expertise: 'AI Security, Adversarial ML, Privacy',
    },
    {
      email: 'mentor12@example.com',
      expertise: 'Generative AI, GANs, Diffusion Models',
    },
    {
      email: 'mentor13@example.com',
      expertise: 'AI Research, Academic Publishing, Scientific Methods',
    },
    {
      email: 'mentor14@example.com',
      expertise: 'AI Product Management, Strategy, Business Impact',
    },
    {
      email: 'mentor15@example.com',
      expertise: 'Speech Recognition, Audio Processing, Voice AI',
    },
    {
      email: 'mentor16@example.com',
      expertise: 'AI for Climate Change, Environmental Modeling, Sustainability',
    },
    {
      email: 'mentor17@example.com',
      expertise: 'AI Education, Curriculum Development, Teaching',
    },
    {
      email: 'mentor18@example.com',
      expertise: 'AI in Agriculture, Precision Farming, Crop Analysis',
    },
    {
      email: 'mentor19@example.com',
      expertise: 'AI for Social Good, Humanitarian AI, Impact Assessment',
    },
    {
      email: 'mentor20@example.com',
      expertise: 'AI Startups, Entrepreneurship, Innovation',
    },
    {
      email: 'admin@example.com',
      expertise: 'AI Ethics, Responsible AI, Policy',
    },
  ];

  await prisma.mentor.createMany({
    data: mentorsData.map((mentorData) => ({
      userId: userMap[mentorData.email].id,
      expertise: mentorData.expertise,
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
    })),
  });
}
