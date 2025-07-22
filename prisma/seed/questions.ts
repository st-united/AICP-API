import { PrismaClient, QuestionType, Level, CompetencySkill, SFIALevel } from '@prisma/client';

export async function seedQuestions(prisma: PrismaClient, levels: Level[], competencySkills: CompetencySkill[]) {
  const levelsMap = Object.fromEntries(levels.map((c) => [c.sfiaLevel, c]));
  const competenciesSkillMap = Object.fromEntries(competencySkills.map((c) => [c.name, c]));

  const questionsData = [
    // A1. KHẢ NĂNG THÍCH ỨNG & TƯ DUY PHÁT TRIỂN
    // {
    //   type: QuestionType.SINGLE_CHOICE,
    //   content: 'AI đang thay đổi thế giới công việc. Cách tiếp cận hiệu quả nhất cho người mới bắt đầu là gì?',
    //   level: SFIALevel.LEVEL_1_AWARENESS,
    //   competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 1)',
    //   estimatedTimeMinutes: 1,
    //   difficultyWeight: 1,
    //   answerOptions: [
    //     {
    //       content: 'Tập trung vào việc nâng cao kỹ năng chuyên môn hiện tại vì AI chỉ là công cụ hỗ trợ',
    //       isCorrect: false,
    //     },
    //     {
    //       content: 'Bắt đầu tìm hiểu các công cụ AI cơ bản để hiểu cách chúng có thể tăng cường công việc',
    //       isCorrect: true,
    //     },
    //     { content: 'Theo dõi xu hướng AI qua các nguồn tin tức và chờ đợi hướng dẫn từ tổ chức', isCorrect: false },
    //     { content: 'Nghiên cứu kỹ về lý thuyết AI trước khi thử nghiệm bất kỳ ứng dụng nào', isCorrect: false },
    //   ],
    // },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Công ty bạn vừa triển khai Claude cho toàn bộ nhân viên. Một số đồng nghiệp lo lắng AI sẽ thay thế họ. Là người đã có kinh nghiệm AI, bạn sẽ làm gì? (Chọn các hành động tích cực)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Tổ chức buổi thảo luận để nghe lo ngại và cùng nghiên cứu về tác động AI trong ngành',
          isCorrect: true,
        },
        {
          content:
            'Hướng dẫn đồng nghiệp sử dụng Claude để nâng cao công việc hiện tại và thử nghiệm các trường hợp sử dụng mới',
          isCorrect: true,
        },
        {
          content:
            'Chia sẻ các nghiên cứu tình huống (case studies) và thực hành tốt nhất từ các công ty đã thành công với chuyển đổi AI',
          isCorrect: false,
        },
        {
          content: 'Đề xuất với ban quản lý tổ chức chương trình đào tạo toàn diện về AI cho toàn đội',
          isCorrect: true,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn là Giám đốc Đổi mới của công ty 5000 nhân viên. Ban lãnh đạo muốn "chuyển đổi AI" nhưng chưa có định hướng chiến lược. Phương pháp tiếp cận của bạn?',
      level: SFIALevel.LEVEL_5_INNOVATION,
      competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 5)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 5,
      answerOptions: [
        {
          content: 'Triển khai các công cụ AI quy mô rộng và đo lường chỉ số áp dụng để chứng minh giá trị',
          isCorrect: false,
        },
        {
          content:
            'Phát triển chiến lược AI toàn diện: đánh giá hiện trạng, phân loại ưu tiên các trường hợp sử dụng, trung tâm xuất sắc, quản lý thay đổi có cấu trúc',
          isCorrect: true,
        },
        {
          content:
            'Hợp tác với các nhà cung cấp AI hàng đầu để triển khai các giải pháp đã được chứng minh từ những công ty dẫn đầu ngành',
          isCorrect: false,
        },
        {
          content:
            'Tập trung vào các dự án thử nghiệm có tác động cao để chứng minh lợi tức đầu tư (ROI) trước khi mở rộng toàn tổ chức',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Với tư cách là người dẫn dắt tư tưởng về chuyển đổi AI trong ngành logistics Việt Nam, bạn thấy các công ty đang áp dụng AI một cách phân mảnh và không hiệu quả. Chiến lược để định hình sự thích ứng toàn ngành?',
      level: SFIALevel.LEVEL_7_MASTERY,
      competentcySkillName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 7)',
      estimatedTimeMinutes: 6,
      difficultyWeight: 7,
      answerOptions: [
        {
          content:
            'Thiết lập vị thế dẫn dắt tư tưởng qua các ấn phẩm và hoạt động diễn thuyết để tác động đến định hướng thị trường',
          isCorrect: false,
        },
        {
          content:
            'Xây dựng liên minh ngành, phát triển khung chuyển đổi chung, tạo ra các tiêu chuẩn, hợp tác với chính phủ và các trường đại học để phát triển hệ sinh thái',
          isCorrect: true,
        },
        {
          content: 'Khởi động dịch vụ tư vấn để hỗ trợ trực tiếp các công ty với các phương pháp đã được chứng minh',
          isCorrect: false,
        },
        {
          content:
            'Hợp tác với các nhà cung cấp công nghệ để tạo ra các giải pháp chuyên biệt cho ngành và chiến lược tiếp cận thị trường',
          isCorrect: false,
        },
      ],
    },
    // A2. TỰ HỌC & CẢI TIẾN LIÊN TỤC
    // {
    //   type: QuestionType.SINGLE_CHOICE,
    //   content: 'Tại sao việc cập nhật kiến thức về AI quan trọng đối với các chuyên gia?',
    //   level: SFIALevel.LEVEL_1_AWARENESS,
    //   competentcySkillName: 'Tự Học & Cải Tiến Liên Tục (Level 1)',
    //   estimatedTimeMinutes: 1,
    //   difficultyWeight: 1,
    //   answerOptions: [
    //     {
    //       content: 'Công nghệ AI phát triển nhanh chóng và tác động đến hầu hết các ngành và chức năng công việc',
    //       isCorrect: true,
    //     },
    //     {
    //       content: 'Các công ty ngày càng kỳ vọng nhân viên có hiểu biết cơ bản về các công cụ hiện đại',
    //       isCorrect: false,
    //     },
    //     {
    //       content: 'Kiến thức AI đang trở thành yêu cầu tiêu chuẩn cho các cơ hội thăng tiến nghề nghiệp',
    //       isCorrect: false,
    //     },
    //     { content: 'Xu hướng công nghệ luôn có tính chu kỳ nên quan trọng để đi trước đường cong', isCorrect: false },
    //   ],
    // },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Bạn muốn cập nhật các phát triển AI với tư cách sinh viên. Phương pháp bền vững nào? (Chọn các phương án thực tế)',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Tự Học & Cải Tiến Liên Tục (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        { content: 'Đăng ký 2-3 bản tin AI chất lượng cao và các nguồn nội dung được tuyển chọn', isCorrect: true },
        { content: 'Tham gia các cộng đồng AI để tham gia thảo luận và học hỏi từ đồng nghiệp', isCorrect: true },
        { content: 'Phân bổ thời gian hàng tuần để thử nghiệm với các công cụ và tính năng AI mới', isCorrect: true },
        {
          content:
            'Theo dõi các nhà nghiên cứu và thực hành AI trên mạng xã hội để có thông tin chi tiết thời gian thực',
          isCorrect: true,
        },
        { content: 'Tập trung độc quyền vào các bài báo học thuật để đảm bảo hiểu biết nghiêm ngặt', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Đội cần triển khai GPT-4 cho dịch vụ khách hàng, nhưng chỉ có kinh nghiệm với chatbot cơ bản. Có 3 tháng chuẩn bị. Chiến lược học tập?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Tự Học & Cải Tiến Liên Tục (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Tập trung chuyên sâu vào tài liệu GPT-4 và thông số kỹ thuật', isCorrect: false },
        {
          content: 'Lộ trình học có cấu trúc: Nền tảng LLM → kỹ thuật tạo lệnh → mẫu tích hợp → thử nghiệm thí điểm',
          isCorrect: true,
        },
        {
          content: 'Thuê các chuyên gia tư vấn bên ngoài để xử lý việc triển khai trong khi đội quan sát',
          isCorrect: false,
        },
        { content: 'Bắt đầu triển khai ngay lập tức với phương pháp học qua thực hành và lặp lại', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Giám đốc Học tập cần tạo ra văn hóa học tập AI cho 10.000 nhân viên đa dạng. Phương pháp tiếp cận?',
      level: SFIALevel.LEVEL_6_LEADERSHIP,
      competentcySkillName: 'Tự Học & Cải Tiến Liên Tục (Level 6)',
      estimatedTimeMinutes: 5,
      difficultyWeight: 6,
      answerOptions: [
        {
          content:
            'Triển khai nền tảng học trực tuyến toàn diện với chương trình giảng dạy AI tiêu chuẩn cho tất cả vai trò',
          isCorrect: false,
        },
        {
          content:
            'Thiết lập Hệ sinh thái Học tập AI: lộ trình theo vai trò, cộng đồng thực hành, văn hóa thử nghiệm, chương trình cố vấn, đo lường tác động',
          isCorrect: true,
        },
        { content: 'Tập trung vào đào tạo lãnh đạo để truyền tải kiến thức AI qua hệ thống quản lý', isCorrect: false },
        {
          content:
            'Tạo ra các trung tâm xuất sắc trong các phòng ban chính để thúc đẩy việc áp dụng AI một cách tự nhiên',
          isCorrect: false,
        },
      ],
    },
    // A3. TƯ DUY PHẢN BIỆN & LÝ LUẬN ĐẠO ĐỨC
    // {
    //   type: QuestionType.SINGLE_CHOICE,
    //   content: 'Khi các hệ thống AI đưa ra quyết định bất công, nguyên nhân gốc thường là gì?',
    //   level: SFIALevel.LEVEL_1_AWARENESS,
    //   competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 1)',
    //   estimatedTimeMinutes: 1,
    //   difficultyWeight: 1,
    //   answerOptions: [
    //     { content: 'Dữ liệu huấn luyện phản ánh sự bất bình đẳng lịch sử và các mẫu xã hội', isCorrect: true },
    //     {
    //       content: 'Các thuật toán AI được thiết kế với sở thích cố hữu cho một số kết quả nhất định',
    //       isCorrect: false,
    //     },
    //     { content: 'Sức mạnh xử lý máy tính không đủ để xử lý việc ra quyết định phức tạp', isCorrect: false },
    //     { content: 'Các hệ thống AI thiếu bối cảnh thế giới thực về sự tinh tế xã hội và văn hóa', isCorrect: false },
    //   ],
    // },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Sử dụng ChatGPT để hỗ trợ viết luận cho bài tập học thuật. Phương pháp phù hợp?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content:
            'Sử dụng ChatGPT cho ý tưởng và nghiên cứu, viết nội dung gốc với việc công bố rõ ràng việc sử dụng AI',
          isCorrect: true,
        },
        {
          content:
            'Tạo bản thảo ban đầu với sự hỗ trợ của AI, chỉnh sửa đáng kể với những hiểu biết cá nhân và trích dẫn đóng góp AI',
          isCorrect: false,
        },
        {
          content: 'Sử dụng ChatGPT hoàn toàn để kiểm tra ngữ pháp và cải thiện cấu trúc của nội dung tự viết',
          isCorrect: false,
        },
        {
          content: 'Hợp tác với ChatGPT như một đồng tác giả, thừa nhận đóng góp trong thư mục tham khảo',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Công cụ tuyển dụng AI thể hiện thiên kiến chống lại ứng viên từ một số nhóm dân tộc nhất định. Phản ứng đạo đức? (Chọn các hành động phù hợp)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content:
            'Ngay lập tức tạm dừng sử dụng công cụ cho quyết định tuyển dụng và tiến hành kiểm toán thiên kiến toàn diện',
          isCorrect: true,
        },
        { content: 'Điều tra các nguồn dữ liệu huấn luyện và quy trình ra quyết định thuật toán', isCorrect: true },
        {
          content: 'Phát triển các quy trình phát hiện thiên kiến cho việc triển khai công cụ AI trong tương lai',
          isCorrect: true,
        },
        {
          content: 'Tiếp tục sử dụng nhưng thêm lớp xem xét thủ công cho các nhóm nhân khẩu học bị ảnh hưởng',
          isCorrect: false,
        },
        { content: 'Ghi chép các phát hiện và chia sẻ với các ứng viên bị ảnh hưởng khi thích hợp', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Hệ thống chẩn đoán AI: độ chính xác tổng thể 94% nhưng 78% cho bệnh nhân cao tuổi. Đội ngũ y tế muốn triển khai ngay lập tức do áp lực chi phí. Phản ứng?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content: 'Triển khai với tài liệu toàn diện về các hạn chế và xem xét bắt buộc của bác sĩ',
          isCorrect: false,
        },
        {
          content:
            'Triển khai theo giai đoạn với giám sát của con người được tăng cường cho bệnh nhân cao tuổi và giám sát liên tục',
          isCorrect: true,
        },
        {
          content:
            'Trì hoãn triển khai cho đến khi đạt được sự ngang bằng độ chính xác trên tất cả các nhóm nhân khẩu học',
          isCorrect: false,
        },
        {
          content: 'Triển khai cho bệnh nhân không cao tuổi ban đầu với việc mở rộng dần dần khi hệ thống cải thiện',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Lãnh đạo đạo đức AI cho công ty xe tự lái đa quốc gia. Các quốc gia khác nhau có các giá trị văn hóa khác nhau về việc ra quyết định tai nạn. Phương pháp khung đạo đức?',
      level: SFIALevel.LEVEL_5_INNOVATION,
      competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 5)',
      estimatedTimeMinutes: 5,
      difficultyWeight: 5,
      answerOptions: [
        {
          content: 'Triển khai các nguyên tắc đạo đức phổ quát bất kể các biến thể văn hóa địa phương',
          isCorrect: false,
        },
        {
          content:
            'Thiết kế các khung thích ứng văn hóa duy trì các nguyên tắc an toàn cốt lõi với sự tham gia của các bên liên quan',
          isCorrect: true,
        },
        {
          content: 'Cho phép các đội khu vực phát triển các hướng dẫn đạo đức độc lập dựa trên các giá trị địa phương',
          isCorrect: false,
        },
        { content: 'Tập trung độc quyền vào tối ưu hóa an toàn kỹ thuật, tránh lập trình đạo đức', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Giám đốc AI thiết lập quản trị AI trên toàn tổ chức 50.000 nhân viên với các đơn vị kinh doanh đa dạng (chăm sóc sức khỏe, tài chính, sản phẩm tiêu dùng). Lợi ích của các bên liên quan mâu thuẫn. Chiến lược quản trị?',
      level: SFIALevel.LEVEL_6_LEADERSHIP,
      competentcySkillName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 6)',
      estimatedTimeMinutes: 5,
      difficultyWeight: 6,
      answerOptions: [
        {
          content:
            'Triển khai các chính sách thống nhất trên tất cả các đơn vị kinh doanh với các yêu cầu tuân thủ rõ ràng',
          isCorrect: false,
        },
        {
          content:
            'Tạo ra khung quản trị thích ứng với các nguyên tắc cốt lõi, hướng dẫn riêng cho từng lĩnh vực, và cơ chế đại diện của các bên liên quan',
          isCorrect: true,
        },
        {
          content: 'Cho phép các đơn vị kinh doanh tự điều chỉnh dựa trên các tiêu chuẩn ngành tương ứng của họ',
          isCorrect: false,
        },
        { content: 'Tập trung chủ yếu vào tuân thủ quy định để giảm thiểu rủi ro pháp lý', isCorrect: false },
      ],
    },
    // A4. TRÍ TUỆ RANH GIỚI CON NGƯỜI-AI
    // {
    //   type: QuestionType.SINGLE_CHOICE,
    //   content:
    //     'Trong bối cảnh kinh doanh, khi nào việc giám sát của con người đối với các quyết định AI quan trọng nhất?',
    //   level: SFIALevel.LEVEL_1_AWARENESS,
    //   competentcySkillName: 'Trí Tuệ Ranh Giới Con Người-AI (Level 1)',
    //   estimatedTimeMinutes: 1,
    //   difficultyWeight: 1,
    //   answerOptions: [
    //     {
    //       content: 'Khi các quyết định có tác động đáng kể đến phúc lợi, an toàn hoặc cơ hội sống của con người',
    //       isCorrect: true,
    //     },
    //     { content: 'Khi điểm tin cậy AI giảm xuống dưới ngưỡng được xác định trước', isCorrect: false },
    //     {
    //       content: 'Khi xử lý các giao dịch tài chính có giá trị cao hoặc quyết định kinh doanh chiến lược',
    //       isCorrect: false,
    //     },
    //     {
    //       content: 'Khi các hệ thống AI mới được triển khai và chưa có hồ sơ theo dõi đã được chứng minh',
    //       isCorrect: false,
    //     },
    //   ],
    // },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'ChatGPT khuyến nghị quyết định tài chính lớn cho công ty khởi nghiệp (đầu tư marketing 500 triệu VNĐ). Phương pháp phù hợp?',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Trí Tuệ Ranh Giới Con Người-AI (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        {
          content: 'Triển khai khuyến nghị sau khi xác thực các nguồn dữ liệu và phương pháp lý luận của AI',
          isCorrect: false,
        },
        {
          content: 'Sử dụng như đầu vào phân tích để đánh giá thêm với các chuyên gia lĩnh vực và cố vấn tài chính',
          isCorrect: true,
        },
        {
          content: 'Yêu cầu AI cung cấp phân tích chi phí-lợi ích chi tiết trước khi đưa ra quyết định cuối cùng',
          isCorrect: false,
        },
        {
          content: 'Kết hợp khuyến nghị AI với nghiên cứu thị trường bổ sung và tham vấn các bên liên quan',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Hệ thống HR AI đề xuất từ chối tất cả ứng viên từ một trường đại học cụ thể dựa trên "dữ liệu hiệu suất lịch sử." Với tư cách quản lý tuyển dụng, phản ứng?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Trí Tuệ Ranh Giới Con Người-AI (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Tin tưởng phân tích AI vì các quyết định dựa trên dữ liệu loại bỏ thiên kiến của con người',
          isCorrect: false,
        },
        {
          content: 'Điều tra lý luận đằng sau khuyến nghị, kiểm toán thiên kiến tiềm ẩn, đánh giá công đức cá nhân',
          isCorrect: true,
        },
        { content: 'Ghi đè khuyến nghị AI và phỏng vấn ứng viên để đưa ra đánh giá độc lập', isCorrect: false },
        { content: 'Yêu cầu thêm các chỉ số hiệu suất để xác thực kết luận phân tích của AI', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Thiết kế hệ thống AI cho phê duyệt khoản vay ngân hàng (100 triệu - 10 tỷ VNĐ). Thiết lập ranh giới hiệu quả giữa con người và AI?',
      level: SFIALevel.LEVEL_5_INNOVATION,
      competentcySkillName: 'Trí Tuệ Ranh Giới Con Người-AI (Level 5)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 5,
      answerOptions: [
        {
          content: 'AI xử lý tất cả quyết định với việc xem xét của con người chỉ cho các trường hợp tranh chấp',
          isCorrect: false,
        },
        {
          content:
            'Khung quyết định phân tầng rủi ro: AI tự động phê duyệt cho các trường hợp rủi ro thấp/tin cậy cao, xem xét của con người cho các trường hợp giá trị cao/không chắc chắn, duy trì quyền phủ quyết của con người',
          isCorrect: true,
        },
        { content: 'Quyết định của con người với AI cung cấp khuyến nghị và phân tích hỗ trợ', isCorrect: false },
        {
          content: 'AI sàng lọc sơ bộ với các đội con người đưa ra tất cả quyết định phê duyệt cuối cùng',
          isCorrect: false,
        },
      ],
    },
    // A5. NHẬN THỨC RỦI RO & QUẢN TRỊ AI
    // {
    //   type: QuestionType.SINGLE_CHOICE,
    //   content: 'Mối quan tâm chính khi sử dụng các công cụ AI công cộng (ChatGPT) với dữ liệu công ty?',
    //   level: SFIALevel.LEVEL_1_AWARENESS,
    //   competentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 1)',
    //   estimatedTimeMinutes: 1,
    //   difficultyWeight: 1,
    //   answerOptions: [
    //     { content: 'Khả năng lộ thông tin nhạy cảm cho các hệ thống bên thứ ba', isCorrect: true },
    //     {
    //       content: 'Sự không chính xác trong phản hồi AI dẫn đến thông tin sai lệch trong kinh doanh',
    //       isCorrect: false,
    //     },
    //     {
    //       content: 'Sự phụ thuộc vào các hệ thống bên ngoài cho các quy trình kinh doanh quan trọng',
    //       isCorrect: false,
    //     },
    //     { content: 'Chi phí liên quan đến đăng ký premium và các tính năng doanh nghiệp', isCorrect: false },
    //   ],
    // },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Công ty triển khai AI cho dịch vụ khách hàng. Các chính sách sử dụng thiết yếu? (Chọn các chính sách quan trọng)',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        { content: 'Hạn chế nhập thông tin nhận dạng cá nhân vào các hệ thống AI công cộng', isCorrect: true },
        { content: 'Duy trì các quy trình dự phòng khi các hệ thống AI gặp sự cố ngừng hoạt động', isCorrect: true },
        { content: 'Công bố rõ ràng khi khách hàng tương tác với AI so với đại diện con người', isCorrect: true },
        {
          content: 'Giới hạn việc sử dụng AI trong giờ làm việc để đảm bảo có sự giám sát của con người',
          isCorrect: false,
        },
        {
          content: 'Xem xét và cập nhật thường xuyên các phản hồi AI về độ chính xác và tính phù hợp',
          isCorrect: true,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Triển khai AI trong quy trình tuyển dụng quan trọng. Các thành phần thiết yếu của khung quản trị rủi ro?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Đào tạo toàn diện cho đội ngũ HR với các yêu cầu tuân thủ pháp lý', isCorrect: false },
        {
          content:
            'Đánh giá tác động, giám sát thiên kiến liên tục, quy trình giám sát của con người, thủ tục ứng phó sự cố, kiểm toán vệt toàn diện',
          isCorrect: true,
        },
        { content: 'Các quy trình tuyển dụng dự phòng và chiến lược đa dạng hóa nhà cung cấp', isCorrect: false },
        {
          content: 'Xem xét pháp lý của hợp đồng nhà cung cấp AI với các điều khoản trách nhiệm pháp lý',
          isCorrect: false,
        },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Giám đốc Rủi ro cho tập đoàn tài chính phát triển khung rủi ro AI doanh nghiệp. Nhiều đơn vị kinh doanh sử dụng các ứng dụng AI đa dạng (giao dịch, chấm điểm tín dụng, phát hiện gian lận, dịch vụ khách hàng). Phương pháp tiếp cận?',
      level: SFIALevel.LEVEL_6_LEADERSHIP,
      competentcySkillName: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 6)',
      estimatedTimeMinutes: 5,
      difficultyWeight: 6,
      answerOptions: [
        { content: 'Cấm sử dụng AI cho đến khi các hướng dẫn quy định toàn diện được thiết lập', isCorrect: false },
        {
          content:
            'Phát triển quản trị AI phân tầng rủi ro: xác định khẩu vị rủi ro theo đơn vị kinh doanh, thiết lập cấu trúc quản trị, tạo bảng điều khiển giám sát thời gian thực, quy trình leo thang và ứng phó sự cố',
          isCorrect: true,
        },
        {
          content: 'Cho phép các đơn vị kinh doanh tự quản lý rủi ro AI với giám sát doanh nghiệp định kỳ',
          isCorrect: false,
        },
        { content: 'Tập trung độc quyền vào tuân thủ quy định với các quy định tài chính hiện hành', isCorrect: false },
      ],
    },
    // B1. GIAO TIẾP AI & PROMPT ENGINEERING
    // {
    //   type: QuestionType.SINGLE_CHOICE,
    //   content: 'ChatGPT hỗ trợ động não cho bài luận về biến đổi khí hậu. Lệnh hiệu quả nhất?',
    //   level: SFIALevel.LEVEL_2_FOUNDATION,
    //   competentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 2)',
    //   estimatedTimeMinutes: 2,
    //   difficultyWeight: 2,
    //   answerOptions: [
    //     {
    //       content: 'Phân tích các tác động lớn của biến đổi khí hậu và khuyến nghị các giải pháp toàn diện',
    //       isCorrect: false,
    //     },
    //     {
    //       content:
    //         'Tạo ra 8 góc nhìn độc đáo về tác động biến đổi khí hậu trên các lĩnh vực khác nhau (kinh tế, công nghệ, xã hội, sức khỏe) bao gồm cả thách thức và cơ hội',
    //       isCorrect: true,
    //     },
    //     {
    //       content:
    //         'Tạo dàn ý chi tiết cho bài luận học thuật bao gồm nguyên nhân, tác động và chiến lược giảm thiểu biến đổi khí hậu',
    //       isCorrect: false,
    //     },
    //     {
    //       content: 'Liệt kê 10 vấn đề biến đổi khí hậu quan trọng nhất với giải thích chi tiết và bằng chứng hỗ trợ',
    //       isCorrect: false,
    //     },
    //   ],
    // },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Các kỹ thuật cải thiện chất lượng tạo mã từ LLM? (Chọn các phương pháp hiệu quả)',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Tạo lệnh chuỗi suy nghĩ: "Giải thích phương pháp từng bước trước khi triển khai"',
          isCorrect: true,
        },
        { content: 'Học ít mẫu (Few-shot learning): Cung cấp 2-3 ví dụ đầu vào-đầu ra', isCorrect: true },
        { content: 'Chỉ định vai trò: "Bạn là nhà phát triển Python cấp cao với 10 năm kinh nghiệm"', isCorrect: true },
        { content: 'Đặt temperature=0 để có tính nhất quán tối đa trong đầu ra', isCorrect: false },
        { content: 'Sử dụng dấu phân cách mã rõ ràng như ```python để định dạng', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Xây dựng chatbot dịch vụ khách hàng xử lý thông tin nhạy cảm một cách an toàn. Các biện pháp bảo mật thiết yếu?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Tin tưởng đầu vào người dùng vì dịch vụ khách hàng yêu cầu giao tiếp mở', isCorrect: false },
        {
          content:
            'Triển khai xác thực đầu vào, lệnh có cấu trúc với dấu phân cách, hạn chế dựa trên vai trò, lọc đầu ra',
          isCorrect: true,
        },
        { content: 'Sử dụng phản hồi chung để tránh hoàn toàn các lỗ hổng bảo mật', isCorrect: false },
        { content: 'Dựa độc quyền vào các tính năng an toàn tích hợp của mô hình AI', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Thiết kế hệ thống RAG (Retrieval-Augmented Generation - Tạo Sinh Tăng Cường Truy Xuất) cho kiến thức nội bộ công ty. Các thành phần thiết yếu để triển khai hiệu quả?',
      level: SFIALevel.LEVEL_5_INNOVATION,
      competentcySkillName: 'Giao Tiếp AI & Prompt Engineering (Level 5)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 5,
      answerOptions: [
        {
          content: 'Một mô hình ngôn ngữ lớn duy nhất được huấn luyện độc quyền trên dữ liệu công ty',
          isCorrect: false,
        },
        {
          content:
            'Cơ sở dữ liệu vector, mô hình nhúng, tìm kiếm tương tự, cơ chế xếp hạng lại, quy trình tạo phản hồi',
          isCorrect: true,
        },
        { content: 'Tìm kiếm từ khóa truyền thống kết hợp với tạo phản hồi AI', isCorrect: false },
        { content: 'Nhiều mô hình AI chuyên biệt cho các lĩnh vực kiến thức khác nhau', isCorrect: false },
      ],
    },
    // B2. NGHIÊN CỨU & TỔNG HỢP THÔNG TIN
    // {
    //   type: QuestionType.SINGLE_CHOICE,
    //   content:
    //     'ChatGPT cung cấp dữ liệu thống kê về "việc áp dụng AI trong các công ty Việt Nam" cho bài tập học thuật. Bước xác minh đầu tiên?',
    //   level: SFIALevel.LEVEL_2_FOUNDATION,
    //   competentcySkillName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 2)',
    //   estimatedTimeMinutes: 2,
    //   difficultyWeight: 2,
    //   answerOptions: [
    //     { content: 'Sử dụng dữ liệu ngay lập tức vì tỷ lệ chính xác của ChatGPT thường cao', isCorrect: false },
    //     {
    //       content: 'Tham chiếu chéo với các nguồn có thẩm quyền như báo cáo chính phủ và khảo sát ngành',
    //       isCorrect: true,
    //     },
    //     { content: 'Yêu cầu ChatGPT cung cấp trích dẫn cụ thể và tài liệu nguồn', isCorrect: false },
    //     { content: 'Kiểm tra thông tin so với thống kê áp dụng AI quốc tế', isCorrect: false },
    //   ],
    // },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Nghiên cứu "tác động AI đến thị trường việc làm Việt Nam" cho báo cáo chiến lược. Phương pháp tổng hợp thông tin đa nguồn?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Tập trung độc quyền vào phân tích do AI tạo ra để có tính toàn diện và tốc độ', isCorrect: false },
        {
          content:
            'Sử dụng AI cho nghiên cứu ban đầu và nhận dạng mẫu, xác thực chéo với phỏng vấn chuyên gia, thống kê chính thức, nghiên cứu tình huống thực tế',
          isCorrect: true,
        },
        { content: 'Chỉ dựa vào các nguồn truyền thống để đảm bảo độ tin cậy tối đa', isCorrect: false },
        {
          content: 'Tính trung bình tất cả các nguồn có sẵn mà không xem xét sự khác biệt về độ tin cậy nguồn',
          isCorrect: false,
        },
      ],
    },
    // B3. LÀM VIỆC NHÓM & HỢP TÁC AI-CON NGƯỜI
    // {
    //   type: QuestionType.SINGLE_CHOICE,
    //   content:
    //     'Bạn cùng lớp yêu cầu phản hồi về dự án AI của họ. Mã hoạt động nhưng sử dụng phương pháp không hiệu quả. Phản hồi mang tính xây dựng nhất?',
    //   level: SFIALevel.LEVEL_2_FOUNDATION,
    //   competentcySkillName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 2)',
    //   estimatedTimeMinutes: 2,
    //   difficultyWeight: 2,
    //   answerOptions: [
    //     {
    //       content: 'Khởi đầu tuyệt vời! Đây là các đề xuất tối ưu hóa có thể cải thiện hiệu suất: ...',
    //       isCorrect: true,
    //     },
    //     {
    //       content: 'Nền tảng tốt. Hãy xem xét các phương pháp thay thế này để có hiệu quả tốt hơn: [đề xuất cụ thể]',
    //       isCorrect: false,
    //     },
    //     { content: 'Trông ổn', isCorrect: false },
    //     { content: 'Chỉ ra các vấn đề mà không đưa ra đề xuất cải thiện cụ thể', isCorrect: false },
    //   ],
    // },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Bạn là Quản lý Dự án AI và cần trình bày kết quả dự án chatbot khách hàng cho Hội đồng Điều hành công ty. Dự án đã hoàn thành với các kết quả sau: Chỉ số kỹ thuật: Độ chính xác 87%, thời gian phản hồi 12ms. Tác động kinh doanh: Cải thiện hiệu quả 15%, tiết kiệm chi phí 200.000 USD. Trong buổi họp 15 phút với CEO và các Giám đốc, bạn sẽ cấu trúc bài trình bày như thế nào để tạo tác động mạnh nhất?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        {
          content: 'Bắt đầu với phân tích chi tiết các chỉ số kỹ thuật để chứng minh tính khoa học của dự án',
          isCorrect: false,
        },
        {
          content:
            'Mở đầu bằng tác động kinh doanh, sau đó hỗ trợ bằng bằng chứng kỹ thuật, và kết thúc với đề xuất các bước tiếp theo cụ thể',
          isCorrect: true,
        },
        { content: 'Chỉ tập trung vào các con số kinh doanh để tránh làm phức tạp cuộc họp', isCorrect: false },
        { content: 'Để Hội đồng Điều hành chủ động đặt câu hỏi về những gì họ quan tâm', isCorrect: false },
      ],
    },
    // B4. HIỂU BIẾT DỮ LIỆU & XÁC THỰC
    // {
    //   type: QuestionType.SINGLE_CHOICE,
    //   content: 'Dự án học máy (Machine Learning) yêu cầu bộ dữ liệu hiệu suất sinh viên. Nguồn phù hợp nhất?',
    //   level: SFIALevel.LEVEL_2_FOUNDATION,
    //   competentcySkillName: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 2)',
    //   estimatedTimeMinutes: 2,
    //   difficultyWeight: 2,
    //   answerOptions: [
    //     { content: 'Các bài đăng trên mạng xã hội về hiệu suất học tập và điểm số', isCorrect: false },
    //     { content: 'Bộ dữ liệu giáo dục công khai từ các cơ quan chính phủ hoặc tổ chức nghiên cứu', isCorrect: true },
    //     { content: 'Dữ liệu sinh viên riêng tư từ cơ sở dữ liệu nội bộ của trường đại học bạn', isCorrect: false },
    //     { content: 'Dữ liệu tổng hợp được tạo ra dựa trên các giả định giáo dục', isCorrect: false },
    //   ],
    // },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Mô hình phân loại đạt độ chính xác 95%, nhưng bộ dữ liệu chứa 95% mẫu từ một lớp. Đánh giá tình huống thực tế?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Hiệu suất mô hình xuất sắc với thành tích độ chính xác cao', isCorrect: false },
        {
          content: 'Có khả năng gây hiểu lầm do mất cân bằng lớp - cần phân tích độ chính xác, độ nhạy, điểm F1',
          isCorrect: true,
        },
        { content: 'Độ chính xác đủ để đánh giá hiệu suất, tiến hành triển khai', isCorrect: false },
        { content: 'Tập trung vào đạt 100% độ chính xác trước khi đánh giá thêm', isCorrect: false },
      ],
    },
    // B5. PHÂN TÁCH VẤN ĐỀ & XÁC ĐỊNH PHẠM VI AI
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Công ty khởi nghiệp thương mại điện tử muốn "cải thiện trải nghiệm khách hàng bằng AI." Phương pháp phân tách và định phạm vi?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Xây dựng hệ thống AGI toàn diện giải quyết tất cả các điểm tiếp xúc khách hàng', isCorrect: false },
        {
          content:
            'Phân tách thành các trường hợp sử dụng cụ thể: động cơ khuyến nghị, chatbot hỗ trợ, tối ưu hóa giá, phát hiện gian lận - ưu tiên theo tác động và tính khả thi',
          isCorrect: true,
        },
        { content: 'Tập trung độc quyền vào triển khai chatbot như điểm vào dễ tiếp cận nhất', isCorrect: false },
        { content: 'Thuê ngoài toàn bộ sáng kiến AI cho các nhà cung cấp chuyên biệt', isCorrect: false },
      ],
    },
    // B6. NĂNG LỰC BẢO MẬT & QUYỀN RIÊNG TƯ
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Công ty khởi nghiệp AI thu thập dữ liệu người dùng để huấn luyện mô hình. Các yêu cầu đạo đức và pháp lý thiết yếu?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        {
          content: 'Tính minh bạch thu thập dữ liệu được công bố trong thỏa thuận Điều khoản Dịch vụ',
          isCorrect: false,
        },
        {
          content:
            'Đồng ý có thông tin, tùy chọn từ chối tham gia, nguyên tắc tối thiểu hóa dữ liệu, quy trình lưu trữ an toàn',
          isCorrect: true,
        },
        { content: 'Chỉ yêu cầu mã hóa dữ liệu và cơ sở hạ tầng máy chủ an toàn', isCorrect: false },
        { content: 'Yêu cầu quyền riêng tư chỉ áp dụng cho thông tin cá nhân nhạy cảm', isCorrect: false },
      ],
    },
    // C1. THÀNH THẠO CÔNG CỤ AI CỐT LỜI
    // {
    //   type: QuestionType.SINGLE_CHOICE,
    //   content: 'Công cụ AI tốt nhất để bắt đầu cho sinh viên không có kinh nghiệm trước đó?',
    //   level: SFIALevel.LEVEL_1_AWARENESS,
    //   competentcySkillName: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 1)',
    //   estimatedTimeMinutes: 1,
    //   difficultyWeight: 1,
    //   answerOptions: [
    //     { content: 'ChatGPT phiên bản miễn phí với cơ bản AI đối thoại và ứng dụng đa mục đích', isCorrect: true },
    //     {
    //       content: 'Claude.ai phiên bản miễn phí cung cấp các phong cách và phương pháp tương tác AI khác nhau',
    //       isCorrect: false,
    //     },
    //     { content: 'Bing Chat cung cấp tích hợp thông tin thời gian thực với khả năng AI', isCorrect: false },
    //     { content: 'Google Gemini với tích hợp hệ sinh thái Google và các tính năng hợp tác', isCorrect: false },
    //   ],
    // },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Trưởng nhóm đánh giá 5 công cụ AI cốt lõi cho đội 20 người đa chức năng (phát triển, thiết kế, nội dung, bán hàng). Tiêu chí lựa chọn quan trọng nhất? (Chọn các yếu tố chính)',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 4)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Dễ sử dụng trên các mức độ kỹ năng kỹ thuật khác nhau', isCorrect: true },
        { content: 'Khả năng tích hợp với các công cụ quy trình làm việc hiện có', isCorrect: true },
        { content: 'Hiệu quả chi phí và mô hình cấp phép linh hoạt', isCorrect: true },
        { content: 'Luôn chọn các công cụ mới nhất để duy trì vị thế dẫn đầu công nghệ', isCorrect: false },
        { content: 'Chất lượng hỗ trợ và tính sẵn có của tài nguyên cộng đồng', isCorrect: true },
        { content: 'Tiêu chuẩn tuân thủ bảo mật và quyền riêng tư dữ liệu', isCorrect: true },
      ],
    },
    // C2. ĐÁNH GIÁ & LỰA CHỌN CÔNG CỤ
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        'Sinh viên hạn chế ngân sách tìm kiếm các công cụ học tập AI có giá trị cao. Các lựa chọn dễ tiếp cận tốt nhất? (Chọn các lựa chọn thực tế)',
      level: SFIALevel.LEVEL_2_FOUNDATION,
      competentcySkillName: 'Đánh Giá & Lựa Chọn Công Cụ (Level 2)',
      estimatedTimeMinutes: 2,
      difficultyWeight: 2,
      answerOptions: [
        { content: 'ChatGPT phiên bản miễn phí cho tương tác AI chung và hỗ trợ học tập', isCorrect: true },
        { content: 'Google Colab cho thử nghiệm và thực hành học máy', isCorrect: true },
        { content: 'GitHub Copilot với giảm giá giáo dục sinh viên', isCorrect: true },
        { content: 'Các nền tảng AI doanh nghiệp với tính năng nâng cao', isCorrect: false },
        { content: 'Các mô hình Hugging Face cho thử nghiệm dự án NLP', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Đội đánh giá GitHub Copilot cho 20 nhà phát triển với giá $10/tháng/người. Các yếu tố ROI biện minh cho đầu tư?',
      level: SFIALevel.LEVEL_3_APPLICATION,
      competentcySkillName: 'Đánh Giá & Lựa Chọn Công Cụ (Level 3)',
      estimatedTimeMinutes: 3,
      difficultyWeight: 3,
      answerOptions: [
        { content: 'Số dòng mã được tạo ra mỗi ngày trên các thành viên đội', isCorrect: false },
        {
          content:
            'Cải thiện tốc độ phát triển, giảm thời gian gỡ lỗi, sự hài lòng của nhà phát triển, tăng tốc phân phối tính năng',
          isCorrect: true,
        },
        { content: 'Tiết kiệm chi phí so với việc thuê thêm nguồn lực phát triển', isCorrect: false },
        { content: 'Tăng cường ấn tượng khách hàng và phân biệt thị trường', isCorrect: false },
      ],
    },
    // C3. TÍCH HỢP & THIẾT KẾ QUY TRÌNH
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Ứng dụng thực hiện 10.000 cuộc gọi API hàng ngày đến OpenAI với chi phí leo thang. Chiến lược tối ưu hóa chi phí duy trì chất lượng?',
      level: SFIALevel.LEVEL_4_INTEGRATION,
      competentcySkillName: 'Tích Hợp & Thiết Kế Quy Trình (Level 4)',
      estimatedTimeMinutes: 4,
      difficultyWeight: 4,
      answerOptions: [
        { content: 'Giảm việc sử dụng API bất kể tác động đến chức năng ứng dụng', isCorrect: false },
        {
          content:
            'Triển khai bộ nhớ đệm thông minh, sử dụng các mô hình nhỏ hơn cho các tác vụ đơn giản, gom nhóm các yêu cầu khi có thể',
          isCorrect: true,
        },
        {
          content: 'Chuyển độc quyền sang các giải pháp thay thế miễn phí bất kể tác động chất lượng',
          isCorrect: false,
        },
        { content: 'Chấp nhận chi phí như chi phí không thể tránh khỏi của tích hợp AI', isCorrect: false },
      ],
    },
    // C4. ĐỔI MỚI & PHÁT TRIỂN TÙY CHỈNH
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Sự phát triển nhanh chóng của công cụ AI - công nghệ tiên tiến hôm nay trở thành tiêu chuẩn ngày mai. Chiến lược AI doanh nghiệp cho công ty trên nhiều đơn vị kinh doanh. Phương pháp lợi thế cạnh tranh bền vững?',
      level: SFIALevel.LEVEL_6_LEADERSHIP,
      competentcySkillName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 6)',
      estimatedTimeMinutes: 5,
      difficultyWeight: 6,
      answerOptions: [
        { content: 'Luôn áp dụng các công cụ mới nhất để duy trì vị thế dẫn đầu công nghệ', isCorrect: false },
        {
          content:
            'Phát triển các nguyên tắc kiến trúc thích ứng không phụ thuộc vào công cụ: xây dựng khả năng có thể chuyển đổi, đầu tư vào kỹ năng thích ứng, phòng thí nghiệm đổi mới, đối tác hệ sinh thái, tập trung vào sự xuất sắc dữ liệu và quy trình hơn là phụ thuộc vào công cụ',
          isCorrect: true,
        },
        {
          content: 'Tiêu chuẩn hóa trên các công cụ đã được chứng minh và tránh rủi ro công nghệ thử nghiệm',
          isCorrect: false,
        },
        {
          content: 'Theo các quyết định của người dẫn đầu thị trường và phương pháp đồng thuận ngành',
          isCorrect: false,
        },
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
      competencySkillId: competenciesSkillMap[qData.competentcySkillName].id,
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
