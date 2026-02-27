// components/AuthForm.tsx
import Link from 'next/link';

interface AuthFormProps {
  type: 'login' | 'register';
}

export default function AuthForm({ type }: AuthFormProps) {
  const isLogin = type === 'login';

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}</h2>
        <p className="auth-subtitle">กรุณากรอกข้อมูลเพื่อดำเนินการต่อ</p>
        
        <form className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input type="text" placeholder="John Doe" required />
            </div>
          )}
          <div className="form-group">
            <label>อีเมล</label>
            <input type="email" placeholder="email@company.com" required />
          </div>
          <div className="form-group">
            <label>รหัสผ่าน</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          
          <button type="submit" className="cta-button w-full">
            {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p className="auth-footer">
          {isLogin ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}{' '}
          <Link href={isLogin ? '/register' : '/login'}>
            {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </Link>
        </p>
      </div>
    </div>
  );
}