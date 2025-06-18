import { PrismaClient, QuestionType, Level, CompetencySkill, SFIALevel } from '@prisma/client';

export async function seedQuestions(prisma: PrismaClient, levels: Level[], competencySkills: CompetencySkill[]) {
  const levelsMap = Object.fromEntries(levels.map((c) => [c.sfiaLevel, c]));
  const competenciesSkillMap = Object.fromEntries(competencySkills.map((c) => [c.name, c]));

  const questionsData = [
    // ĐẠO ĐỨC & TRÁCH NHIỆM AI (AI Ethics & Responsibility)
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Thiên lệch AI (AI bias) là gì?',
      level: SFIALevel.LEVEL_1_AWARENESS,
      compatentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 1)',
      estimatedTimeMinutes: 1,
      difficultyWeight: 1,
      answerOptions: [
        { content: 'Hệ thống AI ưa thích một số thương hiệu nhất định', isCorrect: false },
        {
          content: 'AI đưa ra quyết định bất công dựa trên dữ liệu đào tạo thiên lệch (biased training data)',
          isCorrect: true,
        },
        { content: 'AI hoạt động nhanh hơn cho một số người dùng', isCorrect: false },
        { content: 'AI tốn kém khi sử dụng', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn đang sử dụng ChatGPT để hỗ trợ viết bài luận cho trường. Cách tiếp cận phù hợp nhất về tính chính trực học thuật (academic integrity) là gì?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      compatentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        { content: 'Sao chép trực tiếp nội dung ChatGPT tạo ra và nộp bài', isCorrect: false },
        {
          content: 'Sử dụng ChatGPT để lên ý tưởng (brainstorming), sau đó viết nội dung gốc với ghi nguồn rõ ràng',
          isCorrect: true,
        },
        { content: 'Diễn đạt lại nội dung ChatGPT mà không đề cập đến việc sử dụng AI', isCorrect: false },
        { content: 'Sử dụng ChatGPT nhưng không nói với ai', isCorrect: false },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Nhóm của bạn phát hiện công cụ AI tuyển dụng có thiên lệch với ứng viên từ một số nhóm dân tộc nhất định. Hành động nào thể hiện thực hành AI đạo đức? (Chọn tất cả phương án phù hợp)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      compatentcySkillName: 'Trí Tuệ Ranh Giới Con Người-AI (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        { content: 'Ngay lập tức tạm dừng sử dụng công cụ trong quyết định tuyển dụng', isCorrect: true },
        { content: 'Điều tra dữ liệu đào tạo để tìm nguồn gốc thiên lệch', isCorrect: true },
        { content: 'Tiếp tục sử dụng vì về mặt pháp lý là hợp lệ', isCorrect: false },
        {
          content: 'Phát triển giao thức kiểm tra thiên lệch (bias testing protocols) cho các công cụ AI tương lai',
          isCorrect: true,
        },
        { content: 'Thông báo cho các ứng viên bị ảnh hưởng về tình trạng thiên lệch', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn đang phát triển hệ thống AI cho chẩn đoán y tế. Hệ thống đạt độ chính xác 94% tổng thể nhưng chỉ 78% cho bệnh nhân cao tuổi. Nhóm y tế muốn triển khai ngay lập tức do áp lực chi phí. Phản ứng của bạn?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      compatentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content: 'Triển khai ngay lập tức vì độ chính xác 94% tổng thể vượt mức cơ sở của con người',
          isCorrect: false,
        },
        {
          content: 'Từ chối triển khai cho đến khi độ chính xác cho bệnh nhân cao tuổi được cải thiện',
          isCorrect: false,
        },
        {
          content:
            'Triển khai với tài liệu rõ ràng về hạn chế và giám sát bắt buộc của con người cho bệnh nhân cao tuổi',
          isCorrect: true,
        },
        { content: 'Chỉ triển khai cho bệnh nhân không cao tuổi ban đầu', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn đang lãnh đạo bộ phận đạo đức AI cho một tập đoàn đa quốc gia phát triển xe tự lái. Các quốc gia khác nhau có giá trị văn hóa khác nhau về việc ra quyết định trong các tình huống tai nạn không thể tránh khỏi. Bạn tiếp cận thiết kế khung đạo đức này như thế nào?',
      level: SFIALevel.LEVEL_5_INNOVATION,
      compatentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 2)',
      estimatedTimeMinutes: 5,
      difficultyWeight: 5,
      answerOptions: [
        { content: 'Thực hiện các nguyên tắc đạo đức phổ quát bất kể văn hóa địa phương', isCorrect: false },
        {
          content: 'Thiết kế khung đạo đức thích ứng văn hóa trong khi duy trì các nguyên tắc an toàn cốt lõi',
          isCorrect: true,
        },
        { content: 'Để mỗi nhóm quốc gia tự quyết định đạo đức riêng của họ', isCorrect: false },
        { content: 'Chỉ tập trung vào an toàn kỹ thuật, tránh lập trình đạo đức', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Với tư cách Giám đốc AI, bạn phải thiết lập quản trị AI (AI governance) trên toàn tổ chức 50.000 nhân viên với các đơn vị kinh doanh đa dạng. Chiến lược quản trị của bạn?',
      level: SFIALevel.LEVEL_6_LEADERSHIP,
      compatentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 4)',
      estimatedTimeMinutes: 5,
      difficultyWeight: 6,
      answerOptions: [
        { content: 'Thực hiện chính sách thống nhất trên tất cả các đơn vị kinh doanh', isCorrect: false },
        {
          content:
            'Tạo khung quản trị thích ứng với các nguyên tắc cốt lõi, hướng dẫn cụ thể theo lĩnh vực và cơ chế đại diện bên liên quan',
          isCorrect: true,
        },
        { content: 'Để mỗi đơn vị kinh doanh tự quản lý dựa trên tiêu chuẩn ngành của họ', isCorrect: false },
        { content: 'Tập trung chủ yếu vào tuân thủ quy định để giảm thiểu rủi ro pháp lý', isCorrect: false },
      ],
    },
    // HỌC TẬP & THÍCH ỨNG (Learning & Adaptation)
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Tại sao học tập liên tục quan trọng trong AI?',
      level: SFIALevel.LEVEL_1_AWARENESS,
      compatentcySkillName: 'Tự Học & Cải Tiến Liên Tục (Level 1)',
      estimatedTimeMinutes: 1,
      difficultyWeight: 1,
      answerOptions: [
        { content: 'Công nghệ AI không bao giờ thay đổi', isCorrect: false },
        {
          content: 'Công nghệ AI phát triển nhanh chóng và đòi hỏi cập nhật liên tục',
          isCorrect: true,
        },
        { content: 'Chỉ các chuyên gia mới cần học về AI', isCorrect: false },
        { content: 'Học về AI là tùy chọn', isCorrect: false },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Bạn muốn cập nhật các phát triển AI với tư cách sinh viên. Cách tiếp cận nào bền vững?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      compatentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        { content: 'Đọc mọi bài nghiên cứu AI được xuất bản', isCorrect: false },
        { content: 'Theo dõi 2-3 bản tin và blog AI chất lượng', isCorrect: true },
        { content: 'Tham gia cộng đồng AI để thảo luận', isCorrect: true },
        { content: 'Chỉ học những gì được yêu cầu trong chương trình học', isCorrect: false },
        { content: 'Thử nghiệm các công cụ AI mới hàng tháng', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Mô hình machine learning đầu tiên của bạn chỉ đạt độ chính xác 55%. Tư duy hiệu quả nhất là gì?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      compatentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 2)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        { content: 'Cân nhắc chuyển sang lĩnh vực khác', isCorrect: false },
        {
          content: 'Phân tích có hệ thống chất lượng dữ liệu, kỹ thuật tạo đặc trưng và lựa chọn mô hình',
          isCorrect: true,
        },
        { content: 'Sao chép giải pháp hoạt động từ trực tuyến', isCorrect: false },
        { content: 'Tăng độ phức tạp mô hình ngay lập tức', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Tổ chức của bạn muốn áp dụng GPT-4 cho dịch vụ khách hàng. Bạn có 3 tháng để chuẩn bị. Chiến lược học tập của bạn?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      compatentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Chỉ tập trung vào tài liệu kỹ thuật GPT-4', isCorrect: false },
        {
          content:
            'Thiết kế lộ trình học tập có hệ thống: Cơ bản LLM → kỹ thuật prompt → mẫu tích hợp → thử nghiệm pilot',
          isCorrect: true,
        },
        { content: 'Thuê tư vấn ngoài để xử lý mọi thứ', isCorrect: false },
        { content: 'Bắt đầu triển khai ngay lập tức và học trong quá trình thực hiện', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn được giao nhiệm vụ chuẩn bị tổ chức cho thế hệ công nghệ AI tiếp theo. Làm thế nào để xây dựng năng lực học tập thích ứng?',
      level: SFIALevel.LEVEL_5_INNOVATION,
      compatentcySkillName: 'Tư Duy Chiến Lược AI (Level 5)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 5,
      answerOptions: [
        { content: 'Tập trung sâu vào công nghệ hiện tại cho đến khi thành thạo', isCorrect: false },
        {
          content:
            'Phát triển khung meta-learning: hiểu biết dựa trên nguyên tắc, văn hóa thử nghiệm, hợp tác đa chức năng',
          isCorrect: true,
        },
        { content: 'Chờ tiêu chuẩn ngành rõ ràng trước khi đầu tư vào học tập', isCorrect: false },
        { content: 'Thuê chuyên gia cho mỗi công nghệ mới khi nó xuất hiện', isCorrect: false },
      ],
    },
    //TƯ DUY PHẢN BIỆN & PHÂN TÍCH (Critical Thinking & Analysis)
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Khi AI cung cấp thông tin cho bạn, bạn nên làm gì?',
      level: SFIALevel.LEVEL_1_AWARENESS,
      compatentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 2)',
      estimatedTimeMinutes: 1,
      difficultyWeight: 1,
      answerOptions: [
        { content: 'Luôn tin tưởng hoàn toàn', isCorrect: false },
        { content: 'Kiểm tra xem có hợp lý không và xác minh các sự kiện quan trọng', isCorrect: true },
        { content: 'Không bao giờ tin thông tin AI', isCorrect: false },
        { content: 'Chỉ sử dụng để giải trí', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'ChatGPT cung cấp dữ liệu thống kê về "việc áp dụng AI trong các công ty Việt Nam" cho bài tập của bạn. Bước đầu tiên để xác minh là gì?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      compatentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        { content: 'Sử dụng dữ liệu ngay lập tức vì ChatGPT thường chính xác', isCorrect: false },
        { content: 'Kiểm tra chéo với các nguồn chính thức như báo cáo chính phủ và khảo sát ngành', isCorrect: true },
        { content: 'Yêu cầu ChatGPT cung cấp nguồn', isCorrect: false },
        { content: 'Kiểm tra Wikipedia', isCorrect: false },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Startup của bạn phụ thuộc nhiều vào OpenAI API cho các tính năng sản phẩm cốt lõi. Rủi ro liên tục kinh doanh nào nên xem xét? (Chọn tất cả mối quan tâm hợp lệ)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      compatentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 4)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        { content: 'Giới hạn tốc độ API và thay đổi giá', isCorrect: true },
        { content: 'Gián đoạn dịch vụ ảnh hưởng tính khả dụng sản phẩm', isCorrect: true },
        { content: 'Cập nhật mô hình thay đổi hành vi bất ngờ', isCorrect: true },
        { content: 'OpenAI đọc dữ liệu của bạn và đánh cắp ý tưởng kinh doanh', isCorrect: false },
        { content: 'Cần chiến lược dự phòng cho các chức năng quan trọng', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Mô hình AI của bạn cho thấy các chỉ số kỹ thuật tuyệt vời (độ chính xác 95%, độ trễ 12ms, thời gian hoạt động 94%) nhưng kết quả kinh doanh đáng thất vọng (tương tác người dùng giảm 12%). Cách tiếp cận phân tích phù hợp nhất là gì?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      compatentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Chỉ số kỹ thuật là đủ; kinh doanh sẽ thích ứng', isCorrect: false },
        { content: 'Điều tra khoảng cách giữa độ chính xác kỹ thuật và sự hài lòng của người dùng', isCorrect: true },
        { content: 'Chỉ tập trung vào chỉ số kinh doanh và bỏ qua hiệu suất kỹ thuật', isCorrect: false },
        { content: 'Thay thế hệ thống AI ngay lập tức', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn đang đánh giá việc xây dựng giải pháp AI tùy chỉnh so với sử dụng API bên thứ ba cho ứng dụng quan trọng nhiệm vụ với yêu cầu nghiêm ngặt về độ trễ, bảo mật và độ tin cậy. Khung quyết định của bạn?',
      level: SFIALevel.LEVEL_5_INNOVATION,
      compatentcySkillName: 'Tư Duy Chiến Lược AI (Level 5)',
      estimatedTimeMinutes: 5,
      difficultyWeight: 5,
      answerOptions: [
        { content: 'Luôn xây dựng tùy chỉnh cho ứng dụng quan trọng nhiệm vụ', isCorrect: false },
        {
          content:
            'Phân tích chi phí-lợi ích toàn diện: chi phí phát triển, thời gian ra thị trường, chi phí bảo trì, đánh giá rủi ro, so với giá trị chiến lược và yêu cầu',
          isCorrect: true,
        },
        { content: 'Luôn sử dụng API bên thứ ba để giảm độ phức tạp', isCorrect: false },
        { content: 'Để nhóm kỹ thuật quyết định dựa trên sở thích kỹ thuật', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn đang dẫn dắt phát triển tiêu chuẩn ngành cho an toàn AI trong hệ thống tự động. Nhiều bên liên quan (công ty công nghệ, chính phủ, tổ chức an toàn, nhóm lợi ích công cộng) có ưu tiên xung đột. Cách tiếp cận xây dựng đồng thuận của bạn?',
      level: SFIALevel.LEVEL_6_LEADERSHIP,
      compatentcySkillName: 'Tầm Nhìn & Định Hướng AI (Level 7)',
      estimatedTimeMinutes: 5,
      difficultyWeight: 6,
      answerOptions: [
        { content: 'Ưu tiên các công ty công nghệ vì họ xây dựng hệ thống', isCorrect: false },
        {
          content:
            'Tạo điều kiện đối thoại đa bên liên quan, phát triển khung tiêu chuẩn dựa trên bằng chứng, tạo cơ chế quản trị thích ứng',
          isCorrect: true,
        },
        { content: 'Tập trung vào yêu cầu chính phủ như ràng buộc chính', isCorrect: false },
        { content: 'Tạo tiêu chuẩn riêng cho mỗi nhóm bên liên quan', isCorrect: false },
      ],
    },
    // HỢP TÁC & GIAO TIẾP (Collaboration & Communication)
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Khi làm việc trong nhóm mà một số người biết về AI nhiều hơn những người khác, cách tiếp cận tốt nhất là gì?',
      level: SFIALevel.LEVEL_1_AWARENESS,
      compatentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 1)',
      estimatedTimeMinutes: 1,
      difficultyWeight: 1,
      answerOptions: [
        { content: 'Để các chuyên gia làm tất cả công việc liên quan AI', isCorrect: false },
        { content: 'Chia sẻ kiến thức và học hỏi lẫn nhau', isCorrect: true },
        { content: 'Tránh sử dụng AI để giữ mọi thứ đơn giản', isCorrect: false },
        { content: 'Làm việc riêng biệt dựa trên cấp độ kỹ năng AI', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Một bạn cùng lớp nhờ phản hồi về dự án AI của họ. Code hoạt động nhưng sử dụng cách tiếp cận không hiệu quả. Phản hồi mang tính xây dựng nhất là gì?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      compatentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        { content: 'Code rất tệ, bạn nên viết lại hoàn toàn', isCorrect: false },
        { content: 'Khởi đầu tốt! Đây là một số tối ưu hóa có thể cải thiện hiệu suất: ...', isCorrect: true },
        { content: 'Trông ổn để tránh xung đột', isCorrect: false },
        { content: 'Chỉ ra vấn đề mà không đề xuất cải thiện', isCorrect: false },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Nhóm 5 người của bạn có kinh nghiệm AI hỗn hợp: 2 người dùng nâng cao, 2 người mới bắt đầu, 1 thành viên hoài nghi AI. Chiến lược nào thúc đẩy hợp tác hiệu quả? (Chọn các cách tiếp cận mang tính xây dựng)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      compatentcySkillName: 'Tư Duy Chiến Lược AI (Level 5)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        { content: 'Phân chia công việc nghiêm ngặt theo cấp độ kỹ năng AI', isCorrect: false },
        { content: 'Phiên lập trình cặp (pair programming) với các cấp độ kinh nghiệm hỗn hợp', isCorrect: true },
        { content: 'Phiên chia sẻ kiến thức hàng tuần', isCorrect: true },
        { content: 'Để thành viên hoài nghi tự chọn không tham gia các nhiệm vụ AI', isCorrect: false },
        { content: 'Tạo tài nguyên học tập chung và hướng dẫn', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn đang trình bày kết quả dự án AI cho ban điều hành. Kỹ thuật: độ chính xác 87%, độ trễ 12ms. Kinh doanh: cải thiện hiệu quả 15%, tiết kiệm 200.000 USD. Nguyên tắc giao tiếp nào?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      compatentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Chỉ tập trung vào chỉ số kỹ thuật vì chúng chính xác hơn', isCorrect: false },
        {
          content:
            'Dẫn đầu với tác động kinh doanh, hỗ trợ bằng độ tin cậy kỹ thuật, bao gồm các bước tiếp theo rõ ràng',
          isCorrect: true,
        },
        { content: 'Chỉ trình bày chỉ số kinh doanh để giữ đơn giản', isCorrect: false },
        { content: 'Để ban điều hành đặt câu hỏi thay vì cấu trúc bài thuyết trình', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn đang lãnh đạo một liên minh các đối thủ cạnh tranh để thiết lập tiêu chuẩn đạo đức AI toàn cầu. Người tham gia gồm công ty công nghệ lớn, startup, học giả, cơ quan quản lý và nhóm xã hội dân sự với giá trị và động cơ khác biệt. Cách tiếp cận lãnh đạo của bạn?',
      level: SFIALevel.LEVEL_7_MASTERY,
      compatentcySkillName: 'Tư Duy Chiến Lược AI (Level 5)',
      estimatedTimeMinutes: 6,
      difficultyWeight: 7,
      answerOptions: [
        { content: 'Tập trung vào giải pháp kỹ thuật để tránh xung đột giá trị', isCorrect: false },
        {
          content:
            'Thiết kế quy trình đồng thuận đa tầng: thiết lập các nguyên tắc chung, tạo nhóm làm việc cho các lĩnh vực cụ thể, phát triển khung triển khai thích ứng với chu kỳ đánh giá thường xuyên',
          isCorrect: true,
        },
        { content: 'Để lực lượng thị trường tự nhiên quyết định tiêu chuẩn', isCorrect: false },
        { content: 'Ưu tiên lợi ích của các công ty lớn nhất để áp dụng thực tế', isCorrect: false },
      ],
    },
    // KỸ THUẬT PROMPT & GIAO TIẾP AI (Prompt Engineering & AI Communication)
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Tình huống: Bạn cần ChatGPT giúp lên ý tưởng bài luận về biến đổi khí hậu. Prompt nào có khả năng cho kết quả hữu ích nhất?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      compatentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 3)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        { content: 'Ý tưởng biến đổi khí hậu', isCorrect: false },
        {
          content:
            'Tạo ra 8 góc nhìn độc đáo về tác động biến đổi khí hậu trên các lĩnh vực khác nhau (kinh tế, công nghệ, xã hội, sức khỏe) với cả thách thức và cơ hội',
          isCorrect: true,
        },
        { content: 'Viết bài luận cho tôi', isCorrect: false },
        { content: 'Biến đổi khí hậu tốt hay xấu?', isCorrect: false },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Câu Hỏi Kỹ Thuật: Kỹ thuật nào cải thiện chất lượng tạo code từ LLM? (Chọn tất cả cách tiếp cận hiệu quả)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      compatentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Chain-of-thought prompting: "Giải thích cách tiếp cận từng bước trước khi lập trình"',
          isCorrect: true,
        },
        { content: 'Few-shot learning: Cung cấp 2-3 ví dụ đầu vào-đầu ra', isCorrect: true },
        { content: 'Chỉ định vai trò: "Bạn là một lập trình viên Python senior"', isCorrect: true },
        { content: 'Đặt temperature = 0 để có tính nhất quán', isCorrect: false },
        { content: 'Sử dụng dấu phân cách code rõ ràng như python', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Thách Thức Tích Hợp: Bạn đang xây dựng chatbot dịch vụ khách hàng phải xử lý thông tin nhạy cảm một cách an toàn. Biện pháp bảo mật prompt nào là thiết yếu?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      compatentcySkillName: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Tin tưởng đầu vào người dùng vì đây là dịch vụ khách hàng', isCorrect: false },
        {
          content:
            'Triển khai xác thực đầu vào, prompt có cấu trúc với dấu phân cách, hạn chế dựa trên vai trò và lọc đầu ra',
          isCorrect: true,
        },
        { content: 'Chỉ sử dụng phản hồi chung để tránh vấn đề bảo mật', isCorrect: false },
        { content: 'Chỉ dựa vào tính năng an toàn tích hợp của mô hình AI', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Kiến Trúc Nâng Cao: Bạn đang thiết kế hệ thống RAG (Retrieval-Augmented Generation - Tạo Sinh Tăng Cường Truy Xuất) cho kiến thức nội bộ công ty. Thành phần nào là thiết yếu cho triển khai hiệu quả?',
      level: SFIALevel.LEVEL_5_INNOVATION,
      compatentcySkillName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 5)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 5,
      answerOptions: [
        { content: 'Chỉ một mô hình ngôn ngữ lớn với dữ liệu công ty', isCorrect: false },
        {
          content:
            'Cơ sở dữ liệu vector (vector database), mô hình embedding, tìm kiếm tương đồng, cơ chế xếp hạng lại (reranking mechanism) và tạo phản hồi',
          isCorrect: true,
        },
        { content: 'Tìm kiếm từ khóa truyền thống với tạo phản hồi AI', isCorrect: false },
        { content: 'Nhiều mô hình AI riêng biệt cho các lĩnh vực kiến thức khác nhau', isCorrect: false },
      ],
    },
    // DỮ LIỆU & PHƯƠNG PHÁP NGHIÊN CỨU (Data & Research Methodology)
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Điều gì ảnh hưởng đến chi phí sử dụng API AI như OpenAI?',
      level: SFIALevel.LEVEL_1_AWARENESS,
      compatentcySkillName: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 4)',
      estimatedTimeMinutes: 1,
      difficultyWeight: 1,
      answerOptions: [
        { content: 'Màu sắc màn hình máy tính của bạn', isCorrect: false },
        { content: 'Số từ (token) bạn gửi và nhận', isCorrect: true },
        { content: 'Thời gian trong ngày bạn sử dụng', isCorrect: false },
        { content: 'Tốc độ internet của bạn', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Cho dự án machine learning của bạn, bạn cần dataset về hiệu suất học sinh. Nguồn phù hợp nhất là gì?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      compatentcySkillName: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 4)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        { content: 'Bài đăng trên mạng xã hội về điểm số', isCorrect: false },
        { content: 'Dataset giáo dục công khai từ các cơ quan chính phủ', isCorrect: true },
        { content: 'Dữ liệu sinh viên riêng tư từ cơ sở dữ liệu trường của bạn', isCorrect: false },
        { content: 'Dữ liệu bạn tự tạo ra', isCorrect: false },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Bạn tải dataset cho machine learning. Kiểm tra chất lượng nào là thiết yếu? (Chọn các bước quan trọng)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      compatentcySkillName: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 4)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        { content: 'Kiểm tra giá trị bị thiếu và outlier', isCorrect: true },
        { content: 'Xác minh tính nhất quán định dạng dữ liệu', isCorrect: true },
        { content: 'Hiểu cách dữ liệu được thu thập', isCorrect: true },
        { content: 'Giả định dataset là hoàn hảo nếu nó phổ biến', isCorrect: false },
        { content: 'Tìm kiếm thiên lệch tiềm ẩn trong dữ liệu', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Mô hình phân loại của bạn cho độ chính xác 95%, nhưng dataset có 95% mẫu từ một lớp. Tình huống thực sự là gì?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      compatentcySkillName: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Mô hình tuyệt vời với độ chính xác 95%', isCorrect: false },
        {
          content: 'Mô hình có thể chỉ dự đoán lớp đa số - cần kiểm tra precision, recall và F1-score',
          isCorrect: true,
        },
        { content: 'Độ chính xác đủ để đánh giá hiệu suất', isCorrect: false },
        { content: 'Tập trung đạt độ chính xác 100%', isCorrect: false },
      ],
    },
    // GIẢI QUYẾT VẤN ĐỀ & TRIỂN KHAI KỸ THUẬT (Problem Solving & Technical Implementation)
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Mô hình machine learning của bạn cần sức mạnh tính toán nhiều hơn laptop có thể cung cấp. Giải pháp thân thiện với sinh viên tốt nhất là gì?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      compatentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 3)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        { content: 'Mua laptop gaming đắt tiền', isCorrect: false },
        {
          content: 'Sử dụng runtime GPU miễn phí của Google Colab',
          isCorrect: true,
        },
        { content: 'Bỏ qua dự án', isCorrect: false },
        {
          content: 'Chỉ sử dụng mô hình đơn giản chạy trên CPU',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn đang xây dựng hệ thống gợi ý cho dự án thương mại điện tử. Cách tiếp cận thực tế nhất cho nhóm sinh viên là gì?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      compatentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        { content: 'Xây dựng mạng neural từ đầu', isCorrect: false },
        {
          content: 'Bắt đầu với collaborative filtering sử dụng thư viện có sẵn, sau đó cải tiến dựa trên kết quả',
          isCorrect: true,
        },
        {
          content: 'Sao chép chính xác một giải pháp hiện có',
          isCorrect: false,
        },
        { content: 'Chỉ sử dụng gợi ý ngẫu nhiên', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Ứng dụng web được hỗ trợ AI của bạn hoạt động hoàn hảo trong phát triển nhưng thất bại ngẫu nhiên trong sản xuất với người dùng thực. Cách tiếp cận debug có hệ thống của bạn?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      compatentcySkillName: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Xây dựng lại toàn bộ hệ thống', isCorrect: false },
        {
          content:
            'Phân tích sự khác biệt: mẫu dữ liệu, điều kiện tải, hành vi người dùng, giới hạn API, sau đó triển khai monitoring và rollout từ từ',
          isCorrect: true,
        },
        {
          content: 'Bỏ qua lỗi vì nó hoạt động trong phát triển',
          isCorrect: false,
        },
        {
          content: 'Yêu cầu người dùng thay đổi hành vi của họ',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Tổ chức của bạn cần quyết định giữa fine-tuning mô hình độc quyền vs. sử dụng foundation model với RAG cho ứng dụng cụ thể lĩnh vực. Nhiều đơn vị kinh doanh có yêu cầu, ngân sách và timeline khác nhau. Khung chiến lược của bạn?',
      level: SFIALevel.LEVEL_6_LEADERSHIP,
      compatentcySkillName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 5)',
      estimatedTimeMinutes: 5,
      difficultyWeight: 6,
      answerOptions: [
        {
          content: 'Chọn một cách tiếp cận để nhất quán tổ chức',
          isCorrect: false,
        },
        {
          content:
            'Phát triển ma trận quyết định: đánh giá từng use case dựa trên độ nhạy cảm dữ liệu, yêu cầu hiệu suất, ràng buộc chi phí, khả năng bảo trì, sau đó tạo khung quản trị để triển khai',
          isCorrect: true,
        },
        {
          content: 'Để mỗi đơn vị kinh doanh quyết định độc lập',
          isCorrect: false,
        },
        {
          content: 'Luôn chọn phương án tiên tiến kỹ thuật nhất',
          isCorrect: false,
        },
      ],
    },
    //LỰA CHỌN & SỬ DỤNG CÔNG CỤ (Tool Selection & Usage)
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Nếu bạn muốn thử AI miễn phí với tư cách sinh viên, đâu là lựa chọn khởi đầu tốt?',
      level: SFIALevel.LEVEL_1_AWARENESS,
      compatentcySkillName: 'Nhập Môn Công Cụ AI (Level 1)',
      estimatedTimeMinutes: 1,
      difficultyWeight: 1,
      answerOptions: [
        { content: 'ChatGPT Plus (20 USD/tháng)', isCorrect: false },
        { content: 'Phiên bản ChatGPT miễn phí', isCorrect: true },
        { content: 'Phần mềm AI doanh nghiệp', isCorrect: false },
        { content: 'Tự xây dựng AI từ đầu', isCorrect: false },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Với tư cách sinh viên có ngân sách hạn chế, công cụ AI nào mang lại giá trị học tập cao nhất? (Chọn các phương án dễ tiếp cận)',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      compatentcySkillName: 'Nền Tảng Công Cụ AI (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        { content: 'ChatGPT miễn phí để hỗ trợ học tập', isCorrect: true },
        { content: 'Google Colab cho thí nghiệm machine learning', isCorrect: true },
        { content: 'GitHub Copilot với giảm giá sinh viên', isCorrect: true },
        { content: 'Nền tảng AI doanh nghiệp', isCorrect: false },
        { content: 'Mô hình Hugging Face cho dự án NLP', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Nhóm của bạn đang đánh giá GitHub Copilot cho 20 lập trình viên với giá 20 USD/tháng/người. Yếu tố ROI nào biện minh cho khoản đầu tư?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      compatentcySkillName: 'Ứng Dụng Công Cụ AI (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        { content: 'Số dòng code được tạo ra mỗi ngày', isCorrect: false },
        {
          content:
            'Cải thiện tốc độ phát triển, giảm thời gian debug, sự hài lòng của lập trình viên và tăng tốc giao hàng tính năng',
          isCorrect: true,
        },
        { content: 'Chỉ tiết kiệm chi phí so với thuê thêm lập trình viên', isCorrect: false },
        { content: 'Mức độ gây ấn tượng với khách hàng', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Ứng dụng của bạn thực hiện 10.000 lệnh gọi API hàng ngày đến OpenAI với chi phí tăng. Chiến lược tối ưu hóa nào duy trì chất lượng trong khi giảm chi phí?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      compatentcySkillName: 'Tích Hợp Công Cụ AI (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Giảm sử dụng API bất kể tác động', isCorrect: false },
        {
          content: 'Triển khai caching thông minh, sử dụng mô hình nhỏ hơn cho tác vụ đơn giản, gộp request khi có thể',
          isCorrect: true,
        },
        { content: 'Chỉ chuyển sang phương án miễn phí', isCorrect: false },
        { content: 'Chấp nhận chi phí như không thể tránh khỏi', isCorrect: false },
      ],
    },
    // TRIỂN KHAI CHIẾN LƯỢC (Strategic Implementation)
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Ngành của bạn không có giải pháp AI hiện có cho use case cụ thể của bạn. Bạn phải chọn giữa xây dựng giải pháp tùy chỉnh vs. điều chỉnh công cụ hiện có. Khung quyết định của bạn?',
      level: SFIALevel.LEVEL_5_INNOVATION,
      compatentcySkillName: 'Tích Hợp & Thiết Kế Quy Trình (Level 6)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 5,
      answerOptions: [
        { content: 'Luôn xây dựng tùy chỉnh để đảm bảo phù hợp hoàn hảo', isCorrect: false },
        {
          content:
            'Đánh giá: chi phí phát triển, thời gian ra thị trường, yêu cầu bảo trì, sự phù hợp năng lực cốt lõi, lợi thế cạnh tranh, so với giá trị chiến lược',
          isCorrect: true,
        },
        { content: 'Luôn điều chỉnh công cụ hiện có để giảm thiểu rủi ro', isCorrect: false },
        { content: 'Để nhóm kỹ thuật quyết định dựa trên sở thích', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Công cụ AI phát triển nhanh chóng - công nghệ tiên tiến hôm nay trở thành chuẩn mực ngày mai. Bạn chịu trách nhiệm về chiến lược AI doanh nghiệp trên nhiều đơn vị kinh doanh trong công ty Fortune 500. Cách tiếp cận của bạn cho lợi thế cạnh tranh bền vững?',
      level: SFIALevel.LEVEL_7_MASTERY,
      compatentcySkillName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 7)',
      estimatedTimeMinutes: 6,
      difficultyWeight: 7,
      answerOptions: [
        { content: 'Luôn áp dụng công cụ mới nhất để duy trì lãnh đạo công nghệ', isCorrect: false },
        {
          content:
            'Phát triển nguyên tắc kiến trúc thích ứng: xây dựng năng lực độc lập công cụ, đầu tư vào kỹ năng có thể chuyển giao, tạo phòng thí nghiệm đổi mới, thiết lập đối tác trên hệ sinh thái AI, tập trung vào xuất sắc dữ liệu và quy trình thay vì phụ thuộc công cụ',
          isCorrect: true,
        },
        { content: 'Chuẩn hóa trên công cụ đã chứng minh và tránh công nghệ thử nghiệm', isCorrect: false },
        { content: 'Để người dẫn đầu thị trường quyết định hướng và theo đồng thuận ngành', isCorrect: false },
      ],
    },
  ];

  await prisma.question.createMany({
    data: questionsData.map((qData, index) => ({
      type: qData.type,
      content: qData.content,
      estimatedTimeMinutes: qData.estimatedTimeMinutes,
      difficultyWeight: qData.difficultyWeight,
      maxPossibleScore: qData.difficultyWeight,
      sequence: index + 1,
      levelId: levelsMap[qData.level].id,
      competencySkillId: competenciesSkillMap[qData.compatentcySkillName].id,
    })),
  });

  const createdQuestions = await prisma.question.findMany({
    orderBy: { sequence: 'asc' },
  });

  await prisma.answerOption.createMany({
    data: questionsData.flatMap((qData, index) =>
      qData.answerOptions.map((optionData) => ({
        content: optionData.content,
        isCorrect: optionData.isCorrect,
        questionId: createdQuestions[index].id,
      }))
    ),
  });
}
