# 🛠️ Smart Issue Reporting System (ระบบแจ้งซ่อมและจัดการปัญหาอัจฉริยะ)

ระบบแจ้งซ่อมและจัดการปัญหาภายในองค์กร พัฒนาด้วย **Next.js** ผสานการทำงานร่วมกับ **n8n** และ **AI (Google Gemini)** เพื่อวิเคราะห์ปัญหาจากรูปภาพและข้อความโดยอัตโนมัติ พร้อมส่งการแจ้งเตือนแบบ Real-time ผ่าน **LINE** และมีระบบจัดการหลังบ้านสำหรับเจ้าหน้าที่ (Staff)

---

## ✨ ฟีเจอร์หลัก (Key Features)

* **📝 User Report Form:** ผู้ใช้งานสามารถแจ้งปัญหาได้ง่ายๆ ผ่านฟอร์ม (ระบุหัวข้อ, รายละเอียด, สถานที่ และอัปโหลดรูปภาพ)
* **🤖 AI Auto-Categorization:** ใช้ AI Agent (Gemini) วิเคราะห์ปัญหาจาก "รูปภาพ" และ "ข้อความ" เพื่อจัดหมวดหมู่งานอัตโนมัติ (เช่น ไฟฟ้า, ประปา, ไอที, ความปลอดภัย, ความสะอาด, ทั่วไป)
* **📱 LINE Notifications:** เมื่อมีการแจ้งปัญหาใหม่ ระบบจะส่งการแจ้งเตือนเข้ากลุ่ม LINE ทันทีผ่าน n8n Workflow
* **👨‍🔧 Staff Management:** ระบบหลังบ้านสำหรับเจ้าหน้าที่ในการกดรับงาน, อัปเดตสถานะ (รอดำเนินการ, กำลังทำ, เสร็จสิ้น) และเขียนรายงานผล (Staff Report) เมื่อปิดงาน
* **🗄️ Database Integration:** บันทึกข้อมูลตั๋วแจ้งซ่อม (Ticket) อย่างเป็นระบบด้วย MongoDB

---

## 💻 Tech Stack (เครื่องมือที่ใช้พัฒนา)

* **Frontend & Backend API:** [Next.js](https://nextjs.org/)
* **Database:** [MongoDB](https://www.mongodb.com/) (เชื่อมต่อผ่าน Mongoose/Prisma)
* **Automation & Integration:** [n8n](https://n8n.io/) (Webhook & AI Agent)
* **AI Model:** Google Gemini
* **Notification:** LINE Messaging API (ผ่าน n8n)

---

## 🚀 การติดตั้งและใช้งาน (Getting Started)

### 1. Clone โปรเจกต์
```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
```

2. ติดตั้ง Dependencies
Bash
npm install
3. ตั้งค่า Environment Variables (.env)
สร้างไฟล์ชื่อ .env ไว้ที่นอกสุดของโปรเจกต์ (Root Directory) ห้ามใส่ไว้ในโฟลเดอร์ app/ หรือ src/ เด็ดขาด และใส่ค่าดังนี้:

Code snippet
# การเชื่อมต่อฐานข้อมูล MongoDB
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>"

# Webhook URL สำหรับส่งข้อมูลไป n8n (ใช้ Production URL)
N8N_WEBHOOK_URL="https://[your-n8n-domain]/webhook/Replay"
4. รันเซิร์ฟเวอร์จำลอง (Development)
Bash
npm run dev
เปิดเบราว์เซอร์ไปที่ http://localhost:3000 เพื่อดูผลลัพธ์

🧠 การทำงานของ AI Agent (หมวดหมู่ปัญหา)
AI จะวิเคราะห์ปัญหาโดยให้น้ำหนักกับ "รูปภาพ" เป็นหลัก หากข้อความขัดแย้งกับภาพ AI จะยึดรูปภาพในการตัดสินใจจัดหมวดหมู่ดังนี้:

⚡ Electrical: ปัญหาไฟฟ้า, แอร์, แสงสว่าง

💧 Plumbing: ปัญหาประปา, น้ำรั่ว, ท่อตัน

💻 IT: ปัญหาอินเทอร์เน็ต, คอมพิวเตอร์, ระบบเครือข่าย

🚨 Security: ความปลอดภัย, จราจร, อุบัติเหตุ, สิ่งผิดปกติ

🧹 Cleaning: ความสะอาด, ขยะ, ภูมิทัศน์

🔧 General: งานทั่วไปที่ไม่เข้าข่ายหมวดอื่นๆ

📌 หมายเหตุ (Note)
ต้องตั้งค่า Workflow ใน n8n ให้มีสถานะเป็น Active (Published) และใช้ Production Webhook URL เท่านั้น เพื่อให้ระบบทำงานอยู่เบื้องหลังได้ตลอดเวลา

หากมีการแก้ไขไฟล์ .env อย่าลืมลบโฟลเดอร์ .next และรัน npm run dev ใหม่เสมอ

<img width="1909" height="958" alt="Screenshot 2026-03-18 032638" src="https://github.com/user-attachments/assets/b519275e-ee40-4d31-86f4-ae28424379e6" />
<img width="1911" height="955" alt="Screenshot 2026-03-18 032720" src="https://github.com/user-attachments/assets/cfad2ae1-ec56-4e06-b03b-cf801d068b54" />
<img width="1898" height="959" alt="Screenshot 2026-03-18 032752" src="https://github.com/user-attachments/assets/9e4a08dc-e7a1-425b-86e9-63c30b948f30" />
<img width="1888" height="955" alt="Screenshot 2026-03-18 032830" src="https://github.com/user-attachments/assets/ab8d85d1-ba90-4b4c-b293-1d0dae4c5f0d" />
<img width="1905" height="959" alt="Screenshot 2026-03-18 032840" src="https://github.com/user-attachments/assets/19630ebf-ed08-4507-8d84-3c21b408afa4" />
<img width="1892" height="959" alt="Screenshot 2026-03-18 032849" src="https://github.com/user-attachments/assets/ebf831e9-2aa5-43a5-a9a0-d37125b4c275" />
<img width="1010" height="752" alt="image" src="https://github.com/user-attachments/assets/9362caf7-fb2f-41b7-957b-5fd342583657" />







