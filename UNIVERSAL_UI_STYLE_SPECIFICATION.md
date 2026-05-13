# Universal UI Style Specification

Bản đặc tả này mô tả một ngôn ngữ giao diện sáng, sạch, tiết chế và có độ hoàn thiện cao. Nó được viết để AI có thể áp dụng nhất quán cho nhiều loại sản phẩm khác nhau mà vẫn giữ nguyên tinh thần thị giác: nền sáng xanh xám rất nhạt, surface trắng, độ sâu thấp, nhấn bằng một màu xanh duy nhất, và tương tác luôn tinh tế.

## 1. Design Language

- Giao diện phải cho cảm giác hiện đại, gọn, sáng, chuyên nghiệp và hơi premium.
- Mật độ nội dung ở mức medium-compact: không quá thoáng kiểu marketing thuần, nhưng cũng không dày đặc đến mức nặng mắt.
- Độ sâu thị giác thấp: phần lớn cảm giác phân tầng đến từ nền, border, tint và spacing, không đến từ shadow mạnh.
- Tổng thể phải rất clean, không ồn, không nhiều hiệu ứng, không có chi tiết trang trí dư thừa.
- Màu xanh đậm là accent chính duy nhất cho hành động, chọn trạng thái và điểm nhấn quan trọng.
- Tương phản được kiểm soát: rõ ràng nhưng không gắt; ưu tiên clarity hơn drama.
- Tone chỉ dùng giao diện sáng.

## 2. Surface System

- Canvas nền chính dùng `#f4f7fb`, có thể thêm radial tint rất nhẹ ở các góc bằng `#dce9ff` và `#e6f7ff`.
- Primary surface là khối trắng thuần `#ffffff`, có border `1px` màu `#dbe4f0`, bo góc `16px`, và shadow rất nhẹ.
- Secondary surface vẫn giữ nền sáng, nhưng có thể dùng trắng hoặc tint rất nhẹ `#f8fbff` để giảm độ nhấn.
- Nested surface dùng để gom nhóm thông tin bên trong một surface lớn hơn; nó phải nhẹ hơn về độ tương phản, không được nổi hơn container cha.
- Overlay surface dùng nền trắng, border sáng giống hệ chính, bo góc `12px`, shadow mạnh hơn đúng một cấp so với surface thường.
- Thứ tự layer luôn là: canvas nền -> primary surface -> nested/secondary surface -> overlay surface.
- Không dùng blur hoặc lớp kính để tạo phân tầng.

## 3. Interaction DNA

- Mọi interactive element phải giao tiếp trạng thái chủ yếu bằng thay đổi màu, brightness hoặc fill rất nhẹ.
- Hover phải subtle: solid element tăng sáng nhẹ; neutral element thêm nền tint rất mỏng; danger element dùng tint đỏ rất nhạt.
- Active/pressed phải tăng cảm giác chắc hơn bằng màu hoặc độ tương phản, không dùng nén, bounce hay scale.
- Disabled phải giảm prominence bằng opacity khoảng `50%` đến `70%`; có thể dùng `not-allowed`, nhưng không bắt buộc nếu ngữ cảnh đã đủ rõ.
- Focus nên dựa trên đổi màu border sang xanh; nếu cần tăng accessibility, chỉ thêm halo xanh rất mềm, không dùng glow mạnh.
- Motion phải đơn giản, ngắn, dùng transition cơ bản; không dùng spring, ripple hay hiệu ứng phô trương.
- Loading nên giữ ngay trong chính element hoặc surface đang tương tác, bằng cách thay nhãn hoặc nội dung bằng trạng thái ngắn gọn.

## 4. Typography Behavior

- Font chính cho toàn bộ UI là `Be Vietnam Pro`.
- `JetBrains Mono` chỉ dùng cho mã, reference, định danh kỹ thuật hoặc dữ liệu cần cảm giác machine-like.
- Heading phải đậm và tối hơn body rõ rệt, nhưng không cần khoảng cách kích thước quá cực đoan.
- Body text ưu tiên độ đọc ổn định hơn tính biểu cảm; phần lớn nội dung nên nằm ở `14px` đến `16px`.
- Secondary text và metadata phải lùi xuống bằng màu trước, sau đó mới đến weight.
- Uppercase label chỉ dùng rất tiết chế cho nhãn phụ hoặc overline, với tracking rộng khoảng `0.2em` đến `0.24em`.
- Thang kích thước chuẩn là `12 / 14 / 16 / 18 / 20 / 24 / 30 / 36`.
- Weight chuẩn là `400 / 500 / 600 / 700`.
- Heading display lớn dùng `36/700`, heading chính dùng `30/700`, heading cấp nội dung dùng `18/600`, body mặc định dùng `14-16/400`, metadata dùng `12-14/500`.

## 5. Spacing Logic

- Base unit là `4px`.
- Khoảng cách giữa major sections nên nằm trong `20px` đến `24px`.
- Khoảng cách giữa các content blocks cùng cấp nên nằm trong `16px` đến `20px`.
- Khoảng cách giữa các element liên quan trực tiếp nên nằm trong `8px` đến `12px`.
- Nhịp rất compact có thể dùng `6px`, nhưng không nên là mặc định.
- Padding chuẩn cho surface chính là `20px`.
- Padding cho nested surface là `16px`.
- Padding cho compact grouping là `12px`.
- Vertical rhythm trong các hàng dữ liệu dày nên giữ quanh `12px`.
- Khi xuống màn hình nhỏ, giữ nguyên hierarchy spacing và stack lại theo chiều dọc thay vì ép mọi thứ chật hơn quá mức.

## 6. Color Behavior

- `#0f4ad9` là primary color duy nhất cho CTA chính, selection và emphasis quan trọng.
- `#e7efff` là primary soft background cho highlight nhẹ, trạng thái chọn mềm hoặc vùng thông tin cần gọi chú ý mà không gây căng mắt.
- `#e7f8ef`, `#fff6e4`, `#ffe9e9` lần lượt dùng cho success, warning, danger ở dạng soft background.
- Semantic color phải ưu tiên cách dùng "soft background + text đậm hơn", không ưu tiên fill bão hòa mạnh.
- Text chính dùng slate rất đậm như `#0f172a` hoặc họ `slate-800/900`.
- Body text dùng `slate-700/800`.
- Secondary text dùng `slate-600`.
- Muted text và metadata dùng `slate-500`.
- Inverse text chỉ nên xuất hiện trên primary surface đậm, chủ yếu là màu trắng.
- Border luôn low-contrast và đóng vai trò cấu trúc, không phải điểm nhấn.
- Gradient chỉ nên xuất hiện ở canvas nền hoặc một highlight surface hiếm gặp; không trải rộng lên mọi element.

## 7. Shape & Depth

- Philosophy của shape là mềm vừa đủ, thân thiện nhưng vẫn gọn và có tính hệ thống.
- Radius chuẩn cho interactive control là `12px`.
- Radius chuẩn cho surface lớn là `16px`.
- Radius `8px` dùng cho control nhỏ, row action hoặc phần tử cần cảm giác chặt hơn.
- Radius full chỉ dùng cho pill, chip, avatar hoặc token nhỏ.
- Shadow phải được dùng rất tiết chế.
- Surface thường chỉ dùng shadow nhẹ kiểu `shadow-sm`.
- Overlay mới dùng shadow mạnh hơn một cấp.
- Không dùng heavy shadow để tạo cảm giác cao cấp.
- Không dùng blur, frosted glass, glow hoặc depth giả lập kiểu cinematic.

## 8. Do & Don't

- DO giữ toàn bộ UI sáng, nhẹ và rõ cấu trúc.
- DO dùng border mảnh, nhạt để tổ chức layout.
- DO để màu xanh là accent chi phối duy nhất.
- DO tạo hierarchy bằng spacing, tint và typography trước khi nghĩ đến shadow.
- DO dùng nested surface nhạt hơn để gom nhóm nội dung liên quan.
- DO giữ hover feedback tinh tế và color-based.
- DO giữ density ở mức gọn nhưng vẫn dễ đọc.
- DON'T dùng dark theme trong ngôn ngữ này.
- DON'T dùng glassmorphism, blur, glow hoặc hiệu ứng kính.
- DON'T dùng heavy gradient trên các element thông thường.
- DON'T dùng shadow dày, đen hoặc lan rộng.
- DON'T đưa thêm nhiều accent bão hòa cạnh tranh với màu xanh chính.
- DON'T dùng motion lớn, playful hoặc gây phân tán.
- DON'T dựa hoàn toàn vào màu để biểu đạt trạng thái nếu nội dung cần độ rõ cao hơn.

## 9. Universal Ruleset

- All surfaces must sit on a light blue-gray canvas with very subtle radial accenting.
- All primary surfaces must use a white fill, `1px` light border, `16px` radius, and low shadow depth.
- All secondary or nested surfaces should reduce emphasis through tint and contrast, not through darker color.
- All overlays must stay white, bordered, softly rounded, and only one elevation level above standard surfaces.
- All interactive elements should communicate hover and active states through restrained color or brightness changes.
- All primary actions must use `#0f4ad9` with white text and semibold weight.
- All neutral actions should stay light, bordered, and gain only a faint tinted hover fill.
- All disabled states must reduce prominence without introducing new colors.
- All text controls should use white backgrounds, light borders, `12px` radius, and blue-focused emphasis.
- All typography must use `Be Vietnam Pro`, with `JetBrains Mono` reserved for technical strings.
- All headings should be darker and heavier than body text, with contrast driven mainly by weight and tone.
- All spacing should follow a `4px` system and maintain clear separation between sections, blocks, and inline elements.
- All semantic highlights should prefer soft tinted backgrounds over saturated fills.
- All depth should come primarily from layering, border contrast, and spacing rather than dramatic shadow.
- Avoid dark surfaces, blur-based styling, glass effects, heavy gradients, and loud motion.
- Avoid multiple competing brand accents.
- Avoid overly sharp corners or overly rounded playful shapes outside the defined radius system.

## 10. Reference Tokens

```css
:root {
  --background: #f4f7fb;
  --foreground: #0f172a;
  --surface-primary: #ffffff;
  --surface-secondary: #f8fbff;
  --surface-border: #dbe4f0;
  --primary: #0f4ad9;
  --primary-soft: #e7efff;
  --success-soft: #e7f8ef;
  --warning-soft: #fff6e4;
  --danger-soft: #ffe9e9;
  --error: #dc2626;
}
```

```ts
fontFamily = {
  ui: "Be Vietnam Pro",
  mono: "JetBrains Mono",
}

fontSize = [12, 14, 16, 18, 20, 24, 30, 36]
fontWeight = [400, 500, 600, 700]

radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
}

spacing = {
  base: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
}
```
