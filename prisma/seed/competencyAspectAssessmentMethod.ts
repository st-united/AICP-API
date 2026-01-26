import { AssessmentMethod, CompetencyAspect, PrismaClient } from '@prisma/client';
import { AssessmentMethodSeedEnum } from './constant/assessmentMethodSeedEnum';

export async function seedCompetencyAspectAssessmentMethod(
  prisma: PrismaClient,
  aspects: CompetencyAspect[],
  assessmentMethods: AssessmentMethod[]
) {
  try {
    // Mapping assessment methods với tên aspects
    const mappings: Record<string, string[]> = {
      [AssessmentMethodSeedEnum.TEST_ONLINE]: [
        'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
        'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
        'Trí Tuệ Ranh Giới Con Người-AI (Human-AI Boundary Intelligence)',
        'Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)',
        'Giao Tiếp AI & Prompt Engineering (AI Communication & Prompt Engineering)',
        'Nghiên Cứu & Tổng Hợp Thông Tin (Research & Information Synthesis)',
        'Hiểu Biết Dữ Liệu & Xác Thực (Data Understanding & Validation)',
        'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Problem Decomposition & AI Scoping)',
        'Năng Lực Bảo Mật & Quyền Riêng Tư (Security & Privacy Competency)',
        'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
        'Đánh Giá & Lựa Chọn Công Cụ (Tool Evaluation & Selection)',
        'Tích Hợp & Thiết Kế Quy Trình (Integration & Workflow Design)',
      ],
      [AssessmentMethodSeedEnum.EVIDENCE]: [
        'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
        'Tự Học & Cải Tiến Liên Tục (Self-Learning & Continuous Improvement)',
        'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
        'Giao Tiếp AI & Prompt Engineering (AI Communication & Prompt Engineering)',
        'Nghiên Cứu & Tổng Hợp Thông Tin (Research & Information Synthesis)',
        'Làm Việc Nhóm & Hợp Tác AI-Con Người (Teamwork & Human-AI Collaboration)',
        'Hiểu Biết Dữ Liệu & Xác Thực (Data Understanding & Validation)',
        'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Problem Decomposition & AI Scoping)',
        'Năng Lực Bảo Mật & Quyền Riêng Tư (Security & Privacy Competency)',
        'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
        'Đánh Giá & Lựa Chọn Công Cụ (Tool Evaluation & Selection)',
        'Tích Hợp & Thiết Kế Quy Trình (Integration & Workflow Design)',
        'Đổi Mới & Phát Triển Tùy Chỉnh (Innovation & Custom Development)',
      ],
      [AssessmentMethodSeedEnum.INTERVIEW]: [], // Tất cả aspects
    };

    for (const assessmentMethod of assessmentMethods) {
      const aspectNames = mappings[assessmentMethod.name];

      // Nếu không có mapping, bỏ qua
      if (aspectNames === undefined) {
        console.warn(`No mapping found for assessment method: ${assessmentMethod.name}`);
        continue;
      }

      let selectedAspects: CompetencyAspect[];

      // Interview: lấy tất cả aspects
      if (assessmentMethod.name === AssessmentMethodSeedEnum.INTERVIEW) {
        selectedAspects = aspects;
      } else {
        // Test Online, Evidence: lọc theo tên aspect
        selectedAspects = aspects.filter((aspect) => aspectNames.includes(aspect.name));
      }

      for (const aspect of selectedAspects) {
        const existingMapping = await prisma.competencyAspectAssessmentMethod.findUnique({
          where: {
            competencyAspectId_assessmentMethodId: {
              competencyAspectId: aspect.id,
              assessmentMethodId: assessmentMethod.id,
            },
          },
        });

        if (!existingMapping) {
          await prisma.competencyAspectAssessmentMethod.create({
            data: {
              competencyAspectId: aspect.id,
              assessmentMethodId: assessmentMethod.id,
              weightWithinDimension: 1.0,
            },
          });
        }
      }
    }

    console.log('✅ Seeded CompetencyAspectAssessmentMethod successfully');
  } catch (error) {
    console.error('❌ Error seeding CompetencyAspectAssessmentMethod:', error);
    throw error;
  }
}
