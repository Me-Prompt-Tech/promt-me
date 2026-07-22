"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

export type CompanyAffidavitData = {
  documentNo: string; // ที่ สจก.xxxxxx
  registrationType: string; // เช่น บริษัทจำกัด
  registrationDate: string; // เช่น 3 เมษายน 2556
  registrationNo: string; // เช่น 0105556058490
  companyName: string; // เช่น บริษัท ไนน์ท๊อปอัพ จำกัด
  directors: Array<{
    name: string;
  }>;
  authorizedSigners: string; // เช่น นายสิทธิไกร ตลับนาค ลงลายมือชื่อ...
  registeredCapitalNumber: number; // เช่น 10,000,000.00
  registeredCapitalText: string; // เช่น สิบล้านบาทถ้วน
  headOfficeAddress: string; // เช่น 128/76 อาคารพญาไท พลาซ่า...
  objectivesCount: number; // เช่น 32
  issueDate: string; // เช่น 3 เมษายน พ.ศ. 2556
};

const emptyData: CompanyAffidavitData = {
  documentNo: "",
  registrationType: "บริษัทจำกัด",
  registrationDate: "",
  registrationNo: "",
  companyName: "",
  directors: [{ name: "" }],
  authorizedSigners: "",
  registeredCapitalNumber: 0,
  registeredCapitalText: "",
  headOfficeAddress: "",
  objectivesCount: 0,
  issueDate: "",
};

export function CompanyAffidavitTemplate({
  mode = "edit",
  data,
  onChange,
}: {
  mode?: "edit" | "view";
  data?: Partial<CompanyAffidavitData>;
  onChange?: (data: CompanyAffidavitData) => void;
}) {
  const [formData, setFormData] = useState<CompanyAffidavitData>({ ...emptyData, ...data });

  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = (field: keyof CompanyAffidavitData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateDirector = (index: number, value: string) => {
    const newDirectors = [...formData.directors];
    newDirectors[index] = { name: value };
    setFormData((prev) => ({ ...prev, directors: newDirectors }));
  };

  const addDirector = () => {
    setFormData((prev) => ({
      ...prev,
      directors: [...prev.directors, { name: "" }],
    }));
  };

  const removeDirector = (index: number) => {
    const newDirectors = [...formData.directors];
    newDirectors.splice(index, 1);
    setFormData((prev) => ({ ...prev, directors: newDirectors }));
  };

  return (
    <div className="mx-auto w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-md font-sans text-[15px] leading-relaxed relative flex flex-col items-center py-[20mm] px-[25mm] bg-[url('/dbd-watermark.png')] bg-center bg-no-repeat bg-[length:70%]">
      {/* Garuda placeholder */}
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border border-slate-300 mb-6 shrink-0">
        <span className="text-xs text-slate-400">ตราครุฑ</span>
      </div>

      <div className="w-full flex justify-between items-start mb-10 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold">ที่</span>
          {mode === "edit" ? (
            <input
              type="text"
              className="border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent w-40"
              placeholder="สจก.xxxxxx"
              value={formData.documentNo}
              onChange={(e) => updateField("documentNo", e.target.value)}
            />
          ) : (
            <span>{formData.documentNo}</span>
          )}
        </div>
        <div className="text-right leading-relaxed">
          <p>สำนักงานทะเบียนหุ้นส่วนบริษัทกรุงเทพมหานคร</p>
          <p>กรมพัฒนาธุรกิจการค้า กระทรวงพาณิชย์</p>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-10">หนังสือรับรอง</h1>

      <div className="w-full space-y-4">
        <p className="indent-12 flex flex-wrap items-center gap-1">
          ขอรับรองว่าบริษัทนี้ได้จดทะเบียน ตามประมวลกฎหมายแพ่งและพาณิชย์ เป็นนิติบุคคลประเภท
          {mode === "edit" ? (
            <input
              type="text"
              className="border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent w-28 text-center"
              value={formData.registrationType}
              onChange={(e) => updateField("registrationType", e.target.value)}
            />
          ) : (
            <span className="font-semibold">{formData.registrationType}</span>
          )}
          เมื่อวันที่
          {mode === "edit" ? (
            <input
              type="text"
              className="border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent w-40 text-center"
              placeholder="3 เมษายน 2556"
              value={formData.registrationDate}
              onChange={(e) => updateField("registrationDate", e.target.value)}
            />
          ) : (
            <span className="font-semibold">{formData.registrationDate}</span>
          )}
          ทะเบียนเลขที่
          {mode === "edit" ? (
            <input
              type="text"
              className="border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent w-48 text-center"
              value={formData.registrationNo}
              onChange={(e) => updateField("registrationNo", e.target.value)}
            />
          ) : (
            <span className="font-semibold">{formData.registrationNo}</span>
          )}
        </p>

        <p>ปรากฏข้อความในรายการตามเอกสารทะเบียนนิติบุคคล ณ วันออกหนังสือนิ้ ดังนี้</p>

        <div className="space-y-4 pl-4">
          <div className="flex gap-2">
            <span>1.</span>
            <div className="flex-1 flex gap-2">
              <span>ชื่อบริษัท</span>
              {mode === "edit" ? (
                <input
                  type="text"
                  className="flex-1 border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent font-semibold"
                  placeholder="บริษัท ไนน์ท๊อปอัพ จำกัด"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                />
              ) : (
                <span className="font-semibold">{formData.companyName}</span>
              )}
            </div>
          </div>

          <div>
            <div className="flex gap-2 mb-2">
              <span>2.</span>
              <span>กรรมการของบริษัทมี {formData.directors.length} คน ตามรายชื่อดังต่อไปนี้</span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 pl-6">
              {formData.directors.map((director, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <span className="w-4">{index + 1}.</span>
                  {mode === "edit" ? (
                    <>
                      <input
                        type="text"
                        className="flex-1 border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent"
                        value={director.name}
                        onChange={(e) => updateDirector(index, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeDirector(index)}
                        className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <span>{director.name}</span>
                  )}
                </div>
              ))}
            </div>
            {mode === "edit" && (
              <button
                type="button"
                onClick={addDirector}
                className="mt-2 ml-6 flex items-center gap-1 text-sm text-teal-600 hover:bg-teal-50 px-2 py-1 rounded"
              >
                <Plus className="w-4 h-4" /> เพิ่มกรรมการ
              </button>
            )}
          </div>

          <div className="flex gap-2 items-start">
            <span>3.</span>
            <div className="flex-1 flex flex-col gap-1">
              <span>จำนวนหรือชื่อกรรมการซึ่งลงชื่อผูกพันบริษัทได้คือ</span>
              {mode === "edit" ? (
                <textarea
                  className="w-full border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent resize-none leading-relaxed"
                  rows={2}
                  placeholder="นายสิทธิไกร ตลับนาค ลงลายมือชื่อและประทับตราสำคัญของบริษัท"
                  value={formData.authorizedSigners}
                  onChange={(e) => updateField("authorizedSigners", e.target.value)}
                />
              ) : (
                <span className="leading-relaxed whitespace-pre-wrap">{formData.authorizedSigners}</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <span>4.</span>
            <div className="flex-1 flex flex-wrap gap-2 items-center">
              <span>ทุนจดทะเบียน</span>
              {mode === "edit" ? (
                <input
                  type="number"
                  className="border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent w-40 text-right"
                  value={formData.registeredCapitalNumber}
                  onChange={(e) => updateField("registeredCapitalNumber", Number(e.target.value))}
                />
              ) : (
                <span>{formData.registeredCapitalNumber.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              )}
              <span>บาท /</span>
              {mode === "edit" ? (
                <input
                  type="text"
                  className="flex-1 border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent"
                  placeholder="สิบล้านบาทถ้วน"
                  value={formData.registeredCapitalText}
                  onChange={(e) => updateField("registeredCapitalText", e.target.value)}
                />
              ) : (
                <span>{formData.registeredCapitalText} /</span>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-start">
            <span>5.</span>
            <div className="flex-1 flex flex-wrap gap-2">
              <span>สำนักงานแห่งใหญ่ ตั้งอยู่เลขที่</span>
              {mode === "edit" ? (
                <textarea
                  className="w-full border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent resize-none leading-relaxed"
                  rows={2}
                  value={formData.headOfficeAddress}
                  onChange={(e) => updateField("headOfficeAddress", e.target.value)}
                />
              ) : (
                <span className="leading-relaxed whitespace-pre-wrap">{formData.headOfficeAddress}</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <span>6.</span>
            <div className="flex-1 flex flex-wrap gap-1 items-center">
              <span>วัตถุประสงค์ของบริษัทมี</span>
              {mode === "edit" ? (
                <input
                  type="number"
                  className="border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent w-16 text-center"
                  value={formData.objectivesCount}
                  onChange={(e) => updateField("objectivesCount", Number(e.target.value))}
                />
              ) : (
                <span>{formData.objectivesCount}</span>
              )}
              <span>ข้อ ดังปรากฏในสำเนาเอกสารแนบท้ายหนังสือรับรองนี้จำนวน 2 แผ่น</span>
            </div>
          </div>
          
          <p className="indent-6 mt-2">
            โดยมีลายมือชื่อนายทะเบียนซึ่งรับรองเอกสารและประทับตราสำนักงานทะเบียนหุ้นส่วนบริษัทเป็นสำคัญ
          </p>
        </div>
      </div>

      <div className="mt-16 w-full flex justify-end pr-10">
        <div className="flex items-center gap-2">
          <span>ออกให้ ณ วันที่</span>
          {mode === "edit" ? (
            <input
              type="text"
              className="border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent w-48 text-center"
              placeholder="3 เดือน เมษายน พ.ศ. 2556"
              value={formData.issueDate}
              onChange={(e) => updateField("issueDate", e.target.value)}
            />
          ) : (
            <span>{formData.issueDate}</span>
          )}
        </div>
      </div>

      <div className="mt-20 w-full flex justify-end pr-16 relative">
        <div className="flex flex-col items-center text-sm z-10 mr-8">
          <span className="mb-2 text-blue-800">(นายอนันต ศรีกสิกรณ์)</span>
          <span className="font-semibold">นายทะเบียน</span>
        </div>
      </div>
    </div>
  );
}
