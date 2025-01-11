"use client";
import { useState, useEffect } from "react";
import { environment } from "../env";

const PrivacyPolicyModal = ({ onConsent, onSubmit }) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e) => {
    const element = e.target;
    const isAtBottom =
      Math.abs(
        element.scrollHeight - element.scrollTop - element.clientHeight
      ) <= 1;

    if (isAtBottom) {
      setIsScrolled(true);
    }
  };

  const handleCloseModal = (e) => {
    // ปิด modal เมื่อคลิกพื้นที่ว่าง (นอก modal)
    if (e.target === e.currentTarget) {
      onConsent(); // หรือสามารถใช้ฟังก์ชันอื่นเพื่อปิด modal
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleCloseModal} // เพิ่มการตรวจจับคลิกในพื้นที่ว่าง
    >
      <div
        className="bg-white p-6 rounded-lg max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* modal content */}
        <h2 className="text-xl font-bold mb-4">
          นโยบายความเป็นส่วนตัว (Privacy Policy)
        </h2>
        <div
          className="h-64 overflow-y-auto border p-4 mb-4"
          onScroll={handleScroll}
        >
          <p>
            เรามุ่งมั่นในการคุ้มครองข้อมูลส่วนบุคคลของผู้ใช้บริการ
            <br />
            โดยข้อมูลที่เราเก็บรวบรวม ใช้
            และจัดเก็บจะเป็นไปตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
            <br />
            เพื่อให้เกิดความโปร่งใสและปลอดภัยสูงสุดต่อผู้ใช้งาน
            <br />
            <br />
            <strong>ข้อมูลที่เรารวบรวม</strong>
            <br />
            1.1 อีเมลมหาวิทยาลัย:
            เพื่อใช้สำหรับการยืนยันตัวตนและการอนุญาตให้เข้าใช้ระบบ
            <br />
            1.2 รูปภาพ (Log):
            เพื่อบันทึกการเข้า-ออกเป็นประวัติสำหรับความปลอดภัยและการตรวจสอบในภายหลัง
            <br />
            <br />
            <strong>วัตถุประสงค์ในการเก็บรวบรวมข้อมูล</strong>
            <br />
            2.1 เพื่อบันทึกประวัติการเข้า-ออกในรูปแบบของ Log สำหรับความปลอดภัย
            <br />
            2.2 เพื่อป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต
            <br />
            <br />
            <strong>การใช้และการเปิดเผยข้อมูล</strong>
            <br />
            3.1
            ข้อมูลที่เก็บรวบรวมจะถูกใช้เฉพาะเพื่อวัตถุประสงค์ตามที่ระบุไว้เท่านั้น
            <br />
            3.2 ข้อมูลของท่านจะไม่ถูกเปิดเผยแก่บุคคลภายนอก
            ยกเว้นในกรณีที่กฎหมายกำหนด หรือเพื่อประโยชน์ด้านความปลอดภัย
            <br />
            <br />
            <strong>การเก็บรักษาข้อมูล</strong>
            <br />
            4.1 ข้อมูลของท่านจะถูกจัดเก็บในระบบที่ปลอดภัย โดยมีการเข้ารหัส
            (Encryption)
            <br />
            4.2 Log การเข้า-ออก (รวมถึงรูปภาพ) จะถูกเก็บรักษาไว้ไม่เกิน 1 ปี
            เว้นแต่มีเหตุจำเป็นต้องจัดเก็บนานกว่านั้น
            <br />
            <br />
            <strong>สิทธิของผู้ใช้บริการ</strong>
            <br />
            ท่านมีสิทธิ์ดังต่อไปนี้:
            <br />
            5.1 ขอเข้าถึงและตรวจสอบข้อมูลที่ท่านให้ไว้
            <br />
            5.2 ขอแก้ไข ลบ หรือจำกัดการใช้ข้อมูล
            <br />
            5.3 เพิกถอนความยินยอมในการใช้ข้อมูลของท่าน
            <br />
            <br />
            <strong>การขอความยินยอม</strong>
            <br />
            ก่อนเริ่มใช้งานระบบ ท่านจะต้องให้ความยินยอมผ่านขั้นตอนการยืนยันตัวตน
            <br />
            โดยการล็อกอินด้วยอีเมลมหาวิทยาลัย และยอมรับข้อกำหนดการเก็บข้อมูล
            <br />
            <br />
            <strong>มาตรการความปลอดภัย</strong>
            <br />
            เราใช้เทคโนโลยีที่ทันสมัยในการปกป้องข้อมูลส่วนบุคคล เช่น
            การเข้ารหัสข้อมูล (Encryption) และการจำกัดสิทธิ์การเข้าถึง
            <br />
            <br />
            <strong>การติดต่อ</strong>
            <br />
            หากท่านมีคำถาม ข้อสงสัย
            หรือข้อร้องเรียนเกี่ยวกับการใช้งานระบบหรือนโยบายนี้
            <br />
            ท่านสามารถติดต่อเราได้ที่:
            <br />
            อีเมล: admin@ad.sit.kmutt.ac.th
            <br />
            เบอร์โทรศัพท์: 099-999-9999
            <br />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="agree"
            disabled={!isScrolled}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
          <label htmlFor="agree">
            ฉันได้อ่านและยินยอมตามนโยบายความเป็นส่วนตัว
          </label>
        </div>
        <div className="flex justify-end mt-4">
          <button
            className={`bg-blue-500 text-white py-2 px-4 rounded ${
              !isAgreed ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isAgreed}
            onClick={onSubmit}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
