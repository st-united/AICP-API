import { PrismaClient, CompetencyPillar, SuggestType, CompetencyAspect } from '@prisma/client';

export async function seedAspectSuggestion(prisma: PrismaClient, competencyAspects: CompetencyAspect[]) {
  if (competencyAspects.length <= 0) {
    console.log('Competency aspects not found, skipping aspect suggestion seeding.');
    return;
  }
  const aspectsMapByRepresent = Object.fromEntries(competencyAspects.map((aspect) => [aspect.represent, aspect]));

  const aspectSuggestionData = [
    // A1
    {
      name: 'Yêu cầu chia sẻ về trải nghiệm khi khi học/ áp dụng công cụ AI mới trong học tập, công việc',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A1',
    },
    {
      name: 'Hỏi về việc từng giúp đồng nghiệp/ bạn bè làm quen với AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A1',
    },
    {
      name: 'Hỏi về việc đề xuất cải tiến quy trình bằng AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A1',
    },
    {
      name: 'Hỏi về việc từng tham gia xây dựng định hướng AI cho nhóm/ công ty',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A1',
    },
    {
      name: 'Chỉ phản ứng khi được hướng dẫn, chưa chủ động tìm cách thích nghi với AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A1',
      priority: 1,
    },
    {
      name: 'Có thể làm quen với thay đổi khi được hỗ trợ, sẵn sàng thử nhưng còn lúng túng.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A1',
      priority: 2,
    },
    {
      name: 'Chủ động áp dụng AI mới vào công việc khi được giới thiệu, có thể tự học cơ bản.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A1',
      priority: 3,
    },
    {
      name: 'Nhanh chóng thích nghi, biết cách so sánh và lựa chọn công cụ AI phù hợp, có thể hướng dẫn người khác.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A1',
      priority: 4,
    },
    {
      name: 'Định hình cách tiếp cận khi có thay đổi lớn, đưa ra lời khuyên cho nhóm, chia sẻ kinh nghiệm sử dụng AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A1',
      priority: 5,
    },
    {
      name: 'Chủ động đề xuất cách ứng dụng AI mới, dẫn dắt nhóm vượt qua thay đổi, ảnh hưởng đến quy trình.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A1',
      priority: 6,
    },
    {
      name: 'Định hướng chiến lược ứng dụng AI, truyền cảm hứng và tạo môi trường thích nghi nhanh với thay đổi.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A1',
      priority: 7,
    },
    // A2
    {
      name: 'Hỏi về việc đã học các công cụ như thế nào',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A2',
    },
    {
      name: 'Hỏi về việc duy trì cập nhật công cụ/kiến thức',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A2',
    },
    {
      name: 'Hỏi về hành động ghi nhớ và áp dụng khi học được một công cụ/ kiến thức mới',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A2',
    },
    {
      name: 'Thụ động, chưa có phương pháp học rõ ràng, học khi bị yêu cầu.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A2',
      priority: 1,
    },
    {
      name: 'Có học nhưng rời rạc, chưa có kế hoạch cụ thể, khó duy trì.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A2',
      priority: 2,
    },
    {
      name: 'Bắt đầu có kế hoạch học (MOOC, khóa online), học theo từng đợt.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A2',
      priority: 3,
    },
    {
      name: 'Có lịch học đều đặn, biết cách tự ghi chú/tổng hợp, áp dụng vào tình huống thực tế.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A2',
      priority: 4,
    },
    {
      name: 'Học và ứng dụng liên tục, theo dõi trends, chủ động cập nhật và hệ thống hóa kiến thức.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A2',
      priority: 5,
    },
    {
      name: 'Xây dựng phương pháp học cho nhóm/tổ chức, chia sẻ tài liệu, thúc đẩy tư duy cải tiến.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A2',
      priority: 6,
    },
    {
      name: 'Định hướng văn hóa học tập lâu dài, truyền cảm hứng học hỏi và cải tiến liên tục cho cộng đồng.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A2',
      priority: 7,
    },
    // A3
    {
      name: 'Hỏi về trường hợp gặp AI tạo nội dung sai',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A3',
    },
    {
      name: 'Hỏi về việc từ chối dùng AI vì lý do đạo đức',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A3',
    },
    {
      name: 'Hỏi về việc đề xuất chính sách đạo đức khi sử dụng AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A3',
    },
    {
      name: 'Sử dụng AI theo hướng dẫn cơ bản, chưa nhận thức rõ vấn đề đạo đức.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A3',
      priority: 1,
    },
    {
      name: 'Có ý thức ban đầu về rủi ro sai mục đích, nhưng chưa biết cách xử lý.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A3',
      priority: 2,
    },
    {
      name: 'Nhận biết nội dung sai do AI tạo ra và điều chỉnh cho phù hợp.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A3',
      priority: 3,
    },
    {
      name: 'Chủ động phản hồi/khắc phục khi gặp sai phạm AI, hướng dẫn người khác tránh lạm dụng.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A3',
      priority: 4,
    },
    {
      name: 'Có khả năng từ chối sử dụng AI vì lý do đạo đức, lập luận rõ ràng và đưa ra hành động thay thế.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A3',
      priority: 5,
    },
    {
      name: 'Đề xuất chính sách, quy định về đạo đức AI trong nhóm/tổ chức.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A3',
      priority: 6,
    },
    {
      name: 'Định hình chiến lược và văn hóa sử dụng AI có trách nhiệm ở phạm vi rộng (toàn công ty/cộng đồng), truyền cảm hứng về đạo đức AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A3',
      priority: 7,
    },
    // A4
    {
      name: 'Hỏi về những việc AI nên làm và con người nên làm',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A4',
    },
    {
      name: 'Hỏi về việc thiết kế quy trình AI-con người phối hợp',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A4',
    },
    {
      name: 'Hỏi về cách phản biện cho việc AI thay thế hoàn toàn con người',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A4',
    },
    {
      name: 'Sử dụng AI theo chỉ dẫn, chưa có ý thức phân biệt ranh giới AI–con người.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A4',
      priority: 1,
    },
    {
      name: 'Hỗ trợ người khác, có nhận thức ban đầu rằng AI không thay thế hoàn toàn con người nhưng chưa lý giải rõ.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A4',
      priority: 2,
    },
    {
      name: 'Phân biệt được việc gì phù hợp cho AI, việc gì cần con người.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A4',
      priority: 3,
    },
    {
      name: 'Giải thích rõ ràng ranh giới AI–con người, áp dụng được vào tình huống cụ thể.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A4',
      priority: 4,
    },
    {
      name: 'Thiết kế hoặc áp dụng quy trình AI–con người phối hợp, có dẫn chứng từ thực tế.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A4',
      priority: 5,
    },
    {
      name: 'Đưa ra phản biện hệ thống về vai trò AI vs con người, định hướng cách phối hợp trong các tình huống phức tạp.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A4',
      priority: 6,
    },
    {
      name: 'Định hình chiến lược dài hạn về ranh giới AI–con người trong tổ chức/ngành, truyền cảm hứng để duy trì sự cân bằng AI–human.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A4',
      priority: 7,
    },
    // A5
    {
      name: 'Hỏi về tình huống gặp rủi ro khi dùng AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A5',
    },
    {
      name: 'Hỏi về cách kiểm soát output AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A5',
    },
    {
      name: 'Hỏi về việc thiết lập quy trình kiểm tra chất lượng AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'A5',
    },
    {
      name: 'Sử dụng AI theo hướng dẫn, chưa có nhận thức rõ về rủi ro.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A5',
      priority: 1,
    },
    {
      name: 'Nhận biết rủi ro do người khác chỉ ra, biết nhờ hỗ trợ khi gặp vấn đề.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A5',
      priority: 2,
    },
    {
      name: 'Chia sẻ được ví dụ thực tế khi gặp rủi ro với AI, có hành động xử lý cơ bản.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A5',
      priority: 3,
    },
    {
      name: 'Chủ động phân tích rủi ro và sử dụng checklist để kiểm soát output AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A5',
      priority: 4,
    },
    {
      name: 'Xây dựng hoặc hướng dẫn người khác dùng checklist, đảm bảo đầu ra AI đáng tin cậy.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A5',
      priority: 5,
    },
    {
      name: 'Thiết lập hoặc cải tiến quy trình kiểm tra chất lượng AI trong phạm vi nhóm/tổ chức.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A5',
      priority: 6,
    },
    {
      name: 'Định hình chiến lược quản trị rủi ro AI ở cấp tổ chức/ngành, tạo ảnh hưởng rộng rãi.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'A5',
      priority: 7,
    },
    // B1
    {
      name: 'Đặt câu hỏi về việc sử dụng prompt trong học tập/ công việc',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B1',
    },
    {
      name: 'Đặt câu hỏi về việc tinh chỉnh prompt để cải thiện kết quả AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B1',
    },
    {
      name: 'Đặt câu hỏi về việc tạo hệ thống prompt cho quy trình cố định',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B1',
    },
    {
      name: 'Đặt câu hỏi về việc hướng dẫn người khác viết prompt hiệu quả',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B1',
    },
    {
      name: 'Làm theo prompt có sẵn, chưa tự sáng tạo.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B1',
      priority: 1,
    },
    {
      name: 'Biết dùng prompt đơn giản trong học tập/công việc.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B1',
      priority: 2,
    },
    {
      name: 'Chủ động áp dụng prompt, có điều chỉnh nhỏ theo tình huống.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B1',
      priority: 3,
    },
    {
      name: 'Biết thiết kế prompt với mục tiêu rõ ràng, có ví dụ tinh chỉnh để cải thiện kết quả.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B1',
      priority: 4,
    },
    {
      name: 'Tạo checklist/template prompt cho quy trình cố định, hướng dẫn người khác sử dụng.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B1',
      priority: 5,
    },
    {
      name: 'Phát triển hệ thống prompt nâng cao, áp dụng ở mức nhóm/tổ chức.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B1',
      priority: 6,
    },
    {
      name: 'Định hình chiến lược hoặc phương pháp luận về prompt engineering, chia sẻ công khai/tạo ảnh hưởng rộng rãi.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B1',
      priority: 7,
    },
    // B2
    {
      name: 'Đặt câu hỏi về việc dùng AI để hỗ trợ nghiên cứu',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B2',
    },
    {
      name: 'Đặt câu hỏi về quy trình sử dụng AI để viết/tóm tắt báo cáo',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B2',
    },
    {
      name: 'Đặt câu hỏi về việc đảm bảo độ chính xác khi dùng AI để tổng hợp từ nhiều nguồn',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B2',
    },
    {
      name: 'Đặt câu hỏi về việc nghiên cứu có sự phối hợp giữa người & AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B2',
    },
    {
      name: 'Thực hiện nghiên cứu theo chỉ dẫn, chưa biết ứng dụng AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B2',
      priority: 1,
    },
    {
      name: 'Biết AI có thể hỗ trợ nghiên cứu nhưng chỉ ở mức quan sát hoặc nhờ người khác hướng dẫn.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B2',
      priority: 2,
    },
    {
      name: 'Biết cách sử dụng AI cơ bản để tìm thông tin hoặc hỗ trợ nghiên cứu.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B2',
      priority: 3,
    },
    {
      name: 'Có chiến lược rõ ràng khi dùng AI để tổng hợp, mô tả được quy trình viết/tóm tắt báo cáo.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B2',
      priority: 4,
    },
    {
      name: 'Áp dụng kỹ thuật kiểm tra nguồn, so sánh thông tin để đảm bảo độ chính xác khi dùng AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B2',
      priority: 5,
    },
    {
      name: 'Xây dựng quy trình nghiên cứu kết hợp AI–con người, triển khai và có kết quả cụ thể.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B2',
      priority: 6,
    },
    {
      name: 'Định hình cách thức nghiên cứu với AI ở cấp tổ chức/ngành, chia sẻ hoặc ảnh hưởng rộng.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B2',
      priority: 7,
    },
    // B3
    {
      name: 'Đặt câu hỏi về việc sử dụng AI trong teamwork',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B3',
    },
    {
      name: 'Đặt câu hỏi về việc chia sẻ công cụ/ prompt AI cho đồng đội',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B3',
    },
    {
      name: 'Đặt câu hỏi về việc đào tạo hoặc dẫn dẳt nhóm dùng AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B3',
    },
    {
      name: 'Đặt câu hỏi tình huống: Cách xử lý khi có sự bất đồng giữa AI và con người (ý tưởng khác nhau)',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B3',
    },
    {
      name: 'Dùng AI theo hướng dẫn cá nhân, không liên quan đến teamwork.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B3',
      priority: 1,
    },
    {
      name: 'Sử dụng AI riêng lẻ trong nhóm, ít chia sẻ với người khác.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B3',
      priority: 2,
    },
    {
      name: 'Có tham gia teamwork nhưng AI chỉ hỗ trợ cá nhân, chưa tích hợp.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B3',
      priority: 3,
    },
    {
      name: 'Chia sẻ hoặc tích hợp AI vào công việc nhóm; có chia sẻ công cụ/prompt.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B3',
      priority: 4,
    },
    {
      name: 'Chủ động lan tỏa AI trong nhóm, xử lý được tình huống AI–human conflict bằng điều phối cân bằng.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B3',
      priority: 5,
    },
    {
      name: 'Xây dựng template/guide hoặc đào tạo nhóm sử dụng AI, có kết quả rõ ràng.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B3',
      priority: 6,
    },
    {
      name: 'Định hình cách AI–human phối hợp trong tổ chức, tạo ảnh hưởng hệ thống và giải quyết mâu thuẫn ở tầm chiến lược.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B3',
      priority: 7,
    },
    // B4
    {
      name: 'Đặt câu hỏi về cách xử lý khi gặp trường hợp AI cho kết quả sai',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B4',
    },
    {
      name: 'Đặt câu hỏi về việc đảm bảo dữ liệu đầu vào cho AI đủ tin cậy',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B4',
    },
    {
      name: 'Đặt câu hỏi về việc tạo checklist hoặc quy trình xác thực output AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B4',
    },
    {
      name: 'Đặt câu hỏi về việc đảm nhiệm vai trò chịu trách nhiệm về độ tin cậy của kết quả AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B4',
    },
    {
      name: 'Tin hoàn toàn vào AI, không biết phát hiện lỗi.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B4',
      priority: 1,
    },
    {
      name: 'Biết kết quả sai nhưng không rõ nguyên nhân, cần người khác hướng dẫn.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B4',
      priority: 2,
    },
    {
      name: 'Có kiểm tra lại input/output khi thấy nghi ngờ, phát hiện lỗi cơ bản.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B4',
      priority: 3,
    },
    {
      name: 'Thực hiện kiểm tra hệ thống hơn, có quy trình đơn giản để đảm bảo dữ liệu đầu vào.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B4',
      priority: 4,
    },
    {
      name: 'Thực hiện làm sạch dữ liệu theo bước, xây dựng checklist/template xác thực output AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B4',
      priority: 5,
    },
    {
      name: 'Đưa ra và áp dụng quy trình xác thực trong team/dự án, đảm bảo kết quả AI đáng tin cậy.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B4',
      priority: 6,
    },
    {
      name: 'Chịu trách nhiệm và định hình chuẩn chất lượng dữ liệu và kết quả AI ở cấp tổ chức, ảnh hưởng chính sách quản trị dữ liệu.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B4',
      priority: 7,
    },
    // B5
    {
      name: 'Đặt câu hỏi về việc chọn phần nào dùng AI, phần nào không dùng AI khi ứng dụng AI trong dự án',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B5',
    },
    {
      name: 'Đặt câu hỏi về việc xác định phần nào nên dùng AI khi bắt đầu một quy trình mới',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B5',
    },
    {
      name: 'Đặt câu hỏi về việc từ chối dùng AI cho một phần nào đó',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B5',
    },
    {
      name: 'Đặt câu hỏi về việc tư vấn cho team về phạm vị dùng AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B5',
    },
    {
      name: 'Không rõ ràng phần nào dùng hay không dùng AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B5',
      priority: 1,
    },
    {
      name: 'Làm theo hướng dẫn, chưa tự phân tích.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B5',
      priority: 2,
    },
    {
      name: 'Có phân tích cơ bản nhưng còn cảm tính, đưa ra lựa chọn nhưng thiếu tiêu chí rõ ràng.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B5',
      priority: 3,
    },
    {
      name: 'Phân chia hợp lý phần dùng AI/không dùng AI, có tiêu chí lựa chọn (tốc độ, chi phí, độ chính xác…).',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B5',
      priority: 4,
    },
    {
      name: 'Xây dựng tiêu chí hoặc framework đánh giá rõ ràng, có lý do logic khi từ chối dùng AI, hiểu giới hạn/rủi ro, bắt đầu tư vấn cho team về phạm vi ứng dụng AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B5',
      priority: 5,
    },
    {
      name: 'Tạo sơ đồ, hệ thống ra quyết định cho toàn team/dự án, đưa ra tư vấn có ảnh hưởng đến phạm vi ứng dụng AI của nhóm.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B5',
      priority: 6,
    },
    {
      name: 'Định hướng chiến lược dùng/không dùng AI ở cấp tổ chức, truyền cảm hứng, ảnh hưởng tầm rộng đến cách ứng dụng AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B5',
      priority: 7,
    },
    // B6
    {
      name: 'Đặt câu hỏi về việc xử lý dữ liệu nhạy cảm với AI và cách bảo vệ dữ liệu đó',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B6',
    },
    {
      name: 'Đặt câu hỏi về việc kiểm tra đầu ra AI để đảm bảo không rò rỉ thông tin',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B6',
    },
    {
      name: 'Đặt câu hỏi về việc đề xuất quy trình hoặc quy định bảo mật khi dùng AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B6',
    },
    {
      name: 'Đặt câu hỏi về việc tham gia đào tạo / phổ biến nhận thức bảo mật AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'B6',
    },
    {
      name: 'Không có biện pháp khi xử lý dữ liệu nhạy cảm với AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B6',
      priority: 1,
    },
    {
      name: 'Phản xạ còn thụ động, làm theo chỉ dẫn.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B6',
      priority: 2,
    },
    {
      name: 'Có biện pháp cơ bản, rõ ràng để bảo vệ dữ liệu, bắt đầu biết chủ động kiểm soát thông tin đầu vào/ra.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B6',
      priority: 3,
    },
    {
      name: 'Kiểm tra đầu ra AI để tránh rò rỉ thông tin, có checklist hoặc thói quen kiểm tra rõ ràng.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B6',
      priority: 4,
    },
    {
      name: 'Đề xuất quy trình/quy định bảo mật khi dùng AI, biết phân tích rủi ro, đưa ra hành động cụ thể.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B6',
      priority: 5,
    },
    {
      name: 'Quy trình/đề xuất được team áp dụng, tham gia đào tạo hoặc hướng dẫn người khác về bảo mật AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B6',
      priority: 6,
    },
    {
      name: 'Định hình chính sách/chiến lược bảo mật AI ở phạm vi tổ chức, ảnh hưởng đến nhận thức & văn hóa bảo mật toàn diện.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'B6',
      priority: 7,
    },
    // C1
    {
      name: 'Đặt câu hỏi về các công cụ AI thường dùng trong công việc/ học tập',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C1',
    },
    {
      name: 'Đặt câu hỏi về việc sử dụng AI tool giúp tiết kiệm thời gian và tăng hiệu quả',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C1',
    },
    {
      name: 'Đặt câu hỏi về việc chia sẻ/ hướng dẫn người khác sử dụng công cụ AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C1',
    },
    {
      name: 'Đặt câu hỏi về việc xây dựng hệ thống sử dụng AI tool theo quy trình',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C1',
    },
    {
      name: 'Chỉ làm quen, dùng thử công cụ AI theo hướng dẫn.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C1',
      priority: 1,
    },
    {
      name: 'Tự thử nghiệm công cụ AI nhưng chưa có mục tiêu rõ ràng.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C1',
      priority: 2,
    },
    {
      name: 'Dùng công cụ AI thường xuyên với mục tiêu rõ ràng trong học tập/công việc.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C1',
      priority: 3,
    },
    {
      name: 'Biết cách mô tả rõ đầu vào → AI tool → đầu ra để chứng minh hiệu quả, sử dụng AI để tiết kiệm thời gian, tăng năng suất.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C1',
      priority: 4,
    },
    {
      name: 'Chia sẻ, hướng dẫn người khác sử dụng AI tool, có ví dụ thực tế và nhận được phản hồi tích cực.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C1',
      priority: 5,
    },
    {
      name: 'Xây dựng hệ thống hoặc quy trình sử dụng AI tool có cấu trúc rõ ràng, tích hợp AI tool vào workflow của team/dự án.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C1',
      priority: 6,
    },
    {
      name: 'Định hình chiến lược ứng dụng AI tool cho tổ chức, ảnh hưởng đến cách thức toàn bộ nhóm/bộ phận vận hành với AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C1',
      priority: 7,
    },
    // C2
    {
      name: 'Đặt câu hỏi về việc chọn công cụ như thế nào khi có nhiều công cụ AI tương tự nhau',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C2',
    },
    {
      name: 'Đặt câu hỏi về việc so sánh và chọn công cụ AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C2',
    },
    {
      name: 'Đặt câu hỏi về việc tạo bảng so sánh/ đề xuất chiến lược chọn công cụ AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C2',
    },
    {
      name: 'Đặt câu hỏi về việc cố vấn/ đề xuất chiến lược chọn công cụ AI cho nhóm/ tổ chức',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C2',
    },
    {
      name: 'Chưa có khả năng tự chọn, chỉ dùng theo gợi ý/có sẵn.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C2',
      priority: 1,
    },
    {
      name: 'Biết một vài công cụ nhưng chọn theo cảm tính, không có tiêu chí rõ.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C2',
      priority: 2,
    },
    {
      name: 'So sánh chung chung khi có nhiều công cụ tương tự.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C2',
      priority: 3,
    },
    {
      name: 'So sánh theo mục tiêu, ngân sách, UX… để đưa ra lựa chọn hợp lý, có ví dụ thực tế minh họa cách chọn.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C2',
      priority: 4,
    },
    {
      name: 'Tạo bảng so sánh hoặc đề xuất chiến lược chọn công cụ AI, có thể đưa ra khuyến nghị đáng tin cậy cho team.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C2',
      priority: 5,
    },
    {
      name: 'Cố vấn, định hướng chiến lược chọn công cụ AI cho nhóm/tổ chức, ảnh hưởng đến quyết định của nhiều người.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C2',
      priority: 6,
    },
    {
      name: 'Định hình phương pháp, chuẩn mực hoặc chiến lược dài hạn về chọn công cụ AI ở cấp tổ chức/ngành.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C2',
      priority: 7,
    },
    // C3
    {
      name: 'Đặt câu hỏi về việc tích hợp công cụ AI vào quy trình làm việc',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C3',
    },
    {
      name: 'Đặt câu hỏi về việc thiết kế hoặc vẽ workflow AI - human',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C3',
    },
    {
      name: 'Đặt câu hỏi về việc đề xuất tích AI vào quy trình nhóm',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C3',
    },
    {
      name: 'Đặt câu hỏi về việc cải tiến hiệu suất nhờ tích hợp AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C3',
    },
    {
      name: 'Chỉ làm theo hướng dẫn, chưa có ý thức tích hợp AI vào công việc.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C3',
      priority: 1,
    },
    {
      name: 'Biết và sử dụng AI nhưng rời rạc, chưa gắn vào quy trình.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C3',
      priority: 2,
    },
    {
      name: 'Sử dụng AI trong một vài công việc, có thử gắn nhưng chưa hệ thống.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C3',
      priority: 3,
    },
    {
      name: 'Tích hợp AI vào bước cụ thể trong quy trình làm việc, có tính nhất quán.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C3',
      priority: 4,
    },
    {
      name: 'Thiết kế hoặc vẽ workflow AI–human rõ ràng, có sơ đồ minh họa.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C3',
      priority: 5,
    },
    {
      name: 'Đề xuất tích hợp AI vào quy trình nhóm, có ảnh hưởng tới nhiều người và mang lại kết quả cụ thể.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C3',
      priority: 6,
    },
    {
      name: 'Chứng minh hiệu quả cải tiến bằng số liệu trước/sau, ảnh hưởng đến hiệu suất cấp tổ chức hoặc định hình chuẩn tích hợp AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C3',
      priority: 7,
    },
    // C4
    {
      name: 'Đặt câu hỏi về việc tuỳ chỉnh hoặc phát triển công cụ AI',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C4',
    },
    {
      name: 'Đặt câu hỏi về việc xử lý khi gặp tình huống công cụ AI không đáp ứng được yêu cầu',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C4',
    },
    {
      name: 'Đặt câu hỏi về việc xây dựng sản phẩm/ dịch vụ AI phục vụ mục đích cụ thể',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C4',
    },
    {
      name: 'Đặt câu hỏi về việc hướng dẫn người khác cách tạo giải pháp AI tuỳ chỉnh',
      type: SuggestType.MINING_SUGGEST,
      represent: 'C4',
    },
    {
      name: 'Chỉ làm theo hướng dẫn, chưa có ý tưởng đổi mới hay cải tiến công cụ.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C4',
      priority: 1,
    },
    {
      name: 'Biết áp dụng lại prompt hoặc chức năng có sẵn, chưa tuỳ chỉnh nhiều.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C4',
      priority: 2,
    },
    {
      name: 'Sử dụng lại prompt một cách linh hoạt để đáp ứng nhu cầu cơ bản.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C4',
      priority: 3,
    },
    {
      name: 'Có khả năng gọi API, viết script hoặc tạo công cụ nhỏ dựa trên AI.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C4',
      priority: 4,
    },
    {
      name: 'Biết phát triển app/giải pháp AI hoàn chỉnh hơn, khi công cụ AI không đáp ứng, có thể tự tìm cách cải tiến hoặc phát triển thêm.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C4',
      priority: 5,
    },
    {
      name: 'Xây dựng được sản phẩm/dịch vụ AI dùng được trong thực tế, có ảnh hưởng tới nhóm/tổ chức trong cách cải tiến công cụ.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C4',
      priority: 6,
    },
    {
      name: 'Định hướng đổi mới, dẫn dắt hoặc đào tạo/viết tài liệu giúp người khác tạo giải pháp AI tuỳ chỉnh, tạo ảnh hưởng rộng, mang tính chiến lược.',
      type: SuggestType.ASSESSMENT_GUIDED,
      represent: 'C4',
      priority: 7,
    },
  ];
  const dataForPrisma = aspectSuggestionData
    .map((suggestion) => {
      const aspect = aspectsMapByRepresent[suggestion.represent];
      if (!aspect) {
        console.error(`CompetencyAspect not found: ${suggestion.represent}`);
        return null;
      }

      const { represent, ...rest } = suggestion;
      return {
        ...rest,
        aspectId: aspect.id,
      };
    })
    .filter((item) => item !== null);

  const result = await prisma.aspectSuggestion.createMany({
    data: dataForPrisma,
    skipDuplicates: false,
  });
}
