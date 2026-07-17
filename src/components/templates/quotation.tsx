"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";

export type QuotationData = {
  customerName: string;
  customerAddress: string;
  customerTaxId: string;
  customerEmail: string;
  customerAttention: string;
  customerTel: string;

  documentNo: string;
  issueDate: string;
  validDate: string;
  reference: string;

  issuerName: string;
  issuerAddress: string;
  issuerTaxId: string;
  issuerTel: string;
  issuerEmail: string;
  issuerWeb: string;

  items: Array<{
    idNo: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>;

  remarks: string;
  totalAmountText: string;

  paymentBank: string;
  paymentAccountName: string;
  paymentAccountNo: string;

  preparedBy: string;
};

const emptyData: QuotationData = {
  customerName: "",
  customerAddress: "",
  customerTaxId: "",
  customerEmail: "",
  customerAttention: "",
  customerTel: "",
  documentNo: "",
  issueDate: new Date().toISOString().split("T")[0],
  validDate: "",
  reference: "",
  issuerName: "",
  issuerAddress: "",
  issuerTaxId: "",
  issuerTel: "",
  issuerEmail: "",
  issuerWeb: "",
  items: [{ idNo: "", description: "", quantity: 1, unit: "", unitPrice: 0 }],
  remarks: "",
  totalAmountText: "",
  paymentBank: "",
  paymentAccountName: "",
  paymentAccountNo: "",
  preparedBy: "",
};

export function QuotationTemplate({
  mode = "edit",
  data,
  onChange,
}: {
  mode?: "edit" | "view";
  data?: Partial<QuotationData>;
  onChange?: (data: QuotationData) => void;
}) {
  const [formData, setFormData] = useState<QuotationData>({ ...emptyData, ...data });

  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = (field: keyof QuotationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { idNo: "", description: "", quantity: 1, unit: "", unitPrice: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const grandTotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  return (
    <div className="mx-auto w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-md font-sans text-[13px] leading-relaxed relative flex flex-col">
      <div className="flex-1 p-[10mm]">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">ใบเสนอราคา</h1>
            <div className="flex items-baseline gap-4 mt-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quotation</h2>
              <span className="text-slate-500 font-medium">( ต้นฉบับ / original )</span>
            </div>
          </div>
          <div className="w-24 h-24 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
            <span className="text-slate-400 flex flex-col items-center">
              <ImageIcon className="w-6 h-6 mb-1" />
              <span className="text-[10px]">LOGO</span>
            </span>
          </div>
        </div>

        {/* Info Blocks */}
        <div className="grid grid-cols-2 gap-x-12 mb-6">
          {/* Customer Info */}
          <div>
            <div className="flex mb-1">
              <div className="w-32 font-semibold">ลูกค้า <span className="font-normal text-slate-500 text-xs">/ Customer</span></div>
              <div className="flex-1">
                {mode === "edit" ? (
                  <input type="text" className="w-full border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={formData.customerName} onChange={e => updateField("customerName", e.target.value)} />
                ) : (
                  formData.customerName
                )}
              </div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 font-semibold">ที่อยู่ <span className="font-normal text-slate-500 text-xs">/ Address</span></div>
              <div className="flex-1">
                {mode === "edit" ? (
                  <textarea className="w-full border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent resize-none overflow-hidden" rows={2} value={formData.customerAddress} onChange={e => updateField("customerAddress", e.target.value)} />
                ) : (
                  <div className="whitespace-pre-wrap">{formData.customerAddress}</div>
                )}
              </div>
            </div>
            <div className="flex gap-4 mb-1">
              <div className="flex flex-1">
                <div className="w-32 font-semibold">เลขผู้เสียภาษี <span className="font-normal text-slate-500 text-xs">/ Tax ID</span></div>
                <div className="flex-1">
                  {mode === "edit" ? <input type="text" className="w-full border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={formData.customerTaxId} onChange={e => updateField("customerTaxId", e.target.value)} /> : formData.customerTaxId}
                </div>
              </div>
              <div className="flex w-1/3">
                <div className="w-6 font-semibold">E:</div>
                <div className="flex-1">
                  {mode === "edit" ? <input type="text" className="w-full border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={formData.customerEmail} onChange={e => updateField("customerEmail", e.target.value)} /> : formData.customerEmail}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-1">
                <div className="w-32 font-semibold">ผู้ติดต่อ <span className="font-normal text-slate-500 text-xs">/ Attention</span></div>
                <div className="flex-1">
                  {mode === "edit" ? <input type="text" className="w-full border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={formData.customerAttention} onChange={e => updateField("customerAttention", e.target.value)} /> : formData.customerAttention}
                </div>
              </div>
              <div className="flex w-1/3">
                <div className="w-6 font-semibold">T:</div>
                <div className="flex-1">
                  {mode === "edit" ? <input type="text" className="w-full border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={formData.customerTel} onChange={e => updateField("customerTel", e.target.value)} /> : formData.customerTel}
                </div>
              </div>
            </div>
          </div>

          {/* Document Info */}
          <div>
            <div className="flex mb-1">
              <div className="w-24 font-semibold">เลขที่ <span className="font-normal text-slate-500 text-xs">/ No.</span></div>
              <div className="flex-1">
                {mode === "edit" ? (
                  <input type="text" className="w-full border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={formData.documentNo} onChange={e => updateField("documentNo", e.target.value)} />
                ) : (
                  formData.documentNo
                )}
              </div>
            </div>
            <div className="flex mb-1">
              <div className="w-24 font-semibold">วันที่ <span className="font-normal text-slate-500 text-xs">/ Issue</span></div>
              <div className="flex-1">
                {mode === "edit" ? (
                  <input type="date" className="w-full border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={formData.issueDate} onChange={e => updateField("issueDate", e.target.value)} />
                ) : (
                  formData.issueDate
                )}
              </div>
            </div>
            <div className="flex mb-1">
              <div className="w-24 font-semibold">ใช้ได้ถึง <span className="font-normal text-slate-500 text-xs">/ Valid</span></div>
              <div className="flex-1">
                {mode === "edit" ? (
                  <input type="date" className="w-full border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={formData.validDate} onChange={e => updateField("validDate", e.target.value)} />
                ) : (
                  formData.validDate
                )}
              </div>
            </div>
            <div className="flex">
              <div className="w-24 font-semibold">อ้างอิง <span className="font-normal text-slate-500 text-xs">/ Ref</span></div>
              <div className="flex-1">
                {mode === "edit" ? (
                  <input type="text" className="w-full border-b border-dashed border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={formData.reference} onChange={e => updateField("reference", e.target.value)} />
                ) : (
                  formData.reference
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Issuer Info */}
        <div className="border-t-2 border-b-2 border-slate-800 py-3 mb-6 grid grid-cols-2 gap-x-12">
          <div className="flex">
            <div className="w-32 font-semibold">ผู้ออก <span className="font-normal text-slate-500 text-xs block">issuer</span></div>
            <div className="flex-1 space-y-1">
              {mode === "edit" ? <input type="text" className="w-full border-b border-dashed border-slate-300 outline-none bg-transparent" placeholder="ชื่อบริษัทผู้ออก" value={formData.issuerName} onChange={e => updateField("issuerName", e.target.value)} /> : <div>{formData.issuerName}</div>}
              {mode === "edit" ? <textarea className="w-full border-b border-dashed border-slate-300 outline-none bg-transparent resize-none overflow-hidden" rows={2} placeholder="ที่อยู่บริษัทผู้ออก" value={formData.issuerAddress} onChange={e => updateField("issuerAddress", e.target.value)} /> : <div className="whitespace-pre-wrap">{formData.issuerAddress}</div>}
            </div>
          </div>
          <div>
            <div className="flex mb-1">
              <div className="w-32 font-semibold">เลขผู้เสียภาษี <span className="font-normal text-slate-500 text-xs">/ Tax ID</span></div>
              <div className="flex-1">
                {mode === "edit" ? <input type="text" className="w-full border-b border-dashed border-slate-300 outline-none bg-transparent" value={formData.issuerTaxId} onChange={e => updateField("issuerTaxId", e.target.value)} /> : formData.issuerTaxId}
              </div>
            </div>
            <div className="flex gap-4 mb-1">
              <div className="flex w-1/2">
                <div className="w-6 font-semibold">T:</div>
                <div className="flex-1">
                  {mode === "edit" ? <input type="text" className="w-full border-b border-dashed border-slate-300 outline-none bg-transparent" value={formData.issuerTel} onChange={e => updateField("issuerTel", e.target.value)} /> : formData.issuerTel}
                </div>
              </div>
              <div className="flex w-1/2">
                <div className="w-6 font-semibold">E:</div>
                <div className="flex-1">
                  {mode === "edit" ? <input type="text" className="w-full border-b border-dashed border-slate-300 outline-none bg-transparent" value={formData.issuerEmail} onChange={e => updateField("issuerEmail", e.target.value)} /> : formData.issuerEmail}
                </div>
              </div>
            </div>
            <div className="flex">
              <div className="w-6 font-semibold">W:</div>
              <div className="flex-1">
                {mode === "edit" ? <input type="text" className="w-full border-b border-dashed border-slate-300 outline-none bg-transparent" value={formData.issuerWeb} onChange={e => updateField("issuerWeb", e.target.value)} /> : formData.issuerWeb}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full mb-0 border-b border-slate-800">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="py-2 px-1 text-left font-semibold w-24">
                รหัส <span className="font-normal text-slate-500 text-xs block">ID no.</span>
              </th>
              <th className="py-2 px-1 text-left font-semibold">
                คำอธิบาย <span className="font-normal text-slate-500 text-xs block">Description</span>
              </th>
              <th className="py-2 px-1 text-right font-semibold w-24">
                จำนวน <span className="font-normal text-slate-500 text-xs block">Quantity</span>
              </th>
              <th className="py-2 px-1 text-center font-semibold w-20">
                หน่วย <span className="font-normal text-slate-500 text-xs block">Unit</span>
              </th>
              <th className="py-2 px-1 text-right font-semibold w-32">
                ราคาต่อหน่วย <span className="font-normal text-slate-500 text-xs block">Unit Price</span>
              </th>
              <th className="py-2 px-1 text-right font-semibold w-32">
                มูลค่าก่อนภาษี <span className="font-normal text-slate-500 text-xs block">Pre-Tax Amount</span>
              </th>
              {mode === "edit" && <th className="w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index} className="align-top group">
                <td className="py-2 px-1 border-r border-slate-200">
                  {mode === "edit" ? (
                    <input type="text" className="w-full border-b border-transparent hover:border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={item.idNo} onChange={e => updateItem(index, "idNo", e.target.value)} />
                  ) : item.idNo}
                </td>
                <td className="py-2 px-1 border-r border-slate-200">
                  {mode === "edit" ? (
                    <textarea className="w-full border-b border-transparent hover:border-slate-300 focus:border-slate-500 outline-none bg-transparent resize-none overflow-hidden" rows={2} value={item.description} onChange={e => updateItem(index, "description", e.target.value)} />
                  ) : (
                    <div className="whitespace-pre-wrap">{item.description}</div>
                  )}
                </td>
                <td className="py-2 px-1 border-r border-slate-200 text-right">
                  {mode === "edit" ? (
                    <input type="number" className="w-full text-right border-b border-transparent hover:border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={item.quantity} onChange={e => updateItem(index, "quantity", Number(e.target.value))} />
                  ) : item.quantity.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 border-r border-slate-200 text-center">
                  {mode === "edit" ? (
                    <input type="text" className="w-full text-center border-b border-transparent hover:border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={item.unit} onChange={e => updateItem(index, "unit", e.target.value)} />
                  ) : item.unit}
                </td>
                <td className="py-2 px-1 border-r border-slate-200 text-right">
                  {mode === "edit" ? (
                    <input type="number" className="w-full text-right border-b border-transparent hover:border-slate-300 focus:border-slate-500 outline-none bg-transparent" value={item.unitPrice} onChange={e => updateItem(index, "unitPrice", Number(e.target.value))} />
                  ) : item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-1 text-right border-r border-slate-200 bg-slate-50/50">
                  {(item.quantity * item.unitPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                {mode === "edit" && (
                  <td className="py-2 px-1 text-center">
                    <button type="button" onClick={() => removeItem(index)} className="text-rose-500 hover:bg-rose-50 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {/* Filler Row for visual structure */}
            <tr className="h-32">
              <td className="border-r border-slate-200"></td>
              <td className="border-r border-slate-200"></td>
              <td className="border-r border-slate-200"></td>
              <td className="border-r border-slate-200"></td>
              <td className="border-r border-slate-200"></td>
              <td className="border-r border-slate-200"></td>
              {mode === "edit" && <td></td>}
            </tr>
          </tbody>
        </table>

        {mode === "edit" && (
          <button type="button" onClick={addItem} className="mt-2 mb-4 flex items-center gap-1 text-sm text-teal-600 font-medium hover:bg-teal-50 px-2 py-1 rounded">
            <Plus className="w-4 h-4" /> เพิ่มรายการ
          </button>
        )}

        {/* Summary Footer */}
        <div className="flex border-b-2 border-slate-800">
          <div className="flex-1 p-2 border-r border-slate-300">
            <div className="font-semibold mb-1">หมายเหตุ <span className="font-normal text-slate-500 text-xs">/ Remarks</span></div>
            {mode === "edit" ? (
              <textarea className="w-full h-16 border-dashed border border-slate-300 focus:border-slate-500 outline-none bg-transparent p-1" value={formData.remarks} onChange={e => updateField("remarks", e.target.value)} />
            ) : (
              <div className="whitespace-pre-wrap text-slate-600">{formData.remarks}</div>
            )}
          </div>
          <div className="w-[340px]">
            <div className="flex border-b border-slate-300">
              <div className="w-[200px] p-2 text-right font-semibold">ราคาสุทธิสินค้ายกเว้นภาษี (บาท) <span className="font-normal text-slate-500 text-[10px] block">/ VAT-Exempted Amount</span></div>
              <div className="flex-1 p-2 text-right bg-slate-50/50 flex items-center justify-end">{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="flex border-b border-slate-300">
              <div className="w-[200px] p-2 text-right font-bold text-[14px]">จำนวนเงินรวมทั้งสิ้น (บาท) <span className="font-normal text-slate-500 text-[10px] block">/ Grand Total</span></div>
              <div className="flex-1 p-2 text-right bg-slate-50 font-bold text-[15px] flex items-center justify-end">{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="flex bg-slate-200 text-[11px] min-h-[30px]">
              <div className="w-20 p-2 font-semibold">Total Amount</div>
              <div className="flex-1 p-2 text-right text-slate-700 italic">
                {mode === "edit" ? (
                  <input type="text" className="w-full text-right bg-transparent outline-none border-b border-transparent focus:border-slate-400" placeholder="e.g. Eight Thousand Baht" value={formData.totalAmountText} onChange={e => updateField("totalAmountText", e.target.value)} />
                ) : formData.totalAmountText}
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Signatures */}
        <div className="flex mt-6 gap-8">
          <div className="flex-1">
            <div className="font-semibold mb-2">การชำระเงิน <span className="font-normal text-slate-500 text-xs">/ Payment</span></div>
            <div className="flex gap-4 border-b border-slate-300 pb-1 mb-2 font-semibold">
              <div className="w-1/3">ธนาคาร</div>
              <div className="w-1/3">ชื่อบัญชี</div>
              <div className="w-1/3">เลขที่บัญชี</div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/3">
                {mode === "edit" ? <input type="text" className="w-full border-b border-dashed border-slate-300 outline-none bg-transparent" value={formData.paymentBank} onChange={e => updateField("paymentBank", e.target.value)} /> : formData.paymentBank}
              </div>
              <div className="w-1/3">
                {mode === "edit" ? <input type="text" className="w-full border-b border-dashed border-slate-300 outline-none bg-transparent" value={formData.paymentAccountName} onChange={e => updateField("paymentAccountName", e.target.value)} /> : formData.paymentAccountName}
              </div>
              <div className="w-1/3">
                {mode === "edit" ? <input type="text" className="w-full border-b border-dashed border-slate-300 outline-none bg-transparent" value={formData.paymentAccountNo} onChange={e => updateField("paymentAccountNo", e.target.value)} /> : formData.paymentAccountNo}
              </div>
            </div>
          </div>

          <div className="w-48 text-center flex flex-col justify-end">
            <div className="font-semibold mb-8">อนุมัติโดย <span className="font-normal text-slate-500 text-xs">/ Approved by</span></div>
            <div className="border-b border-dashed border-slate-400 mb-2"></div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>วันที่ / Date</span>
              <span>..........................</span>
            </div>
          </div>

          <div className="w-48 text-center flex flex-col justify-end">
            <div className="font-semibold mb-8">ยอมรับใบเสนอราคา <span className="font-normal text-slate-500 text-xs">/ Accepted by</span></div>
            <div className="border-b border-dashed border-slate-400 mb-2"></div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>วันที่ / Date</span>
              <span>..........................</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Page Info */}
      <div className="px-[10mm] pb-[10mm] flex justify-between items-end text-[11px] text-slate-500">
        <div>หน้า 1/1</div>
        <div className="flex items-center gap-1">
          <span>จัดเตรียมโดย / Prepared by</span>
          {mode === "edit" ? (
            <input type="text" className="w-40 border-b border-dashed border-slate-300 outline-none bg-transparent" value={formData.preparedBy} onChange={e => updateField("preparedBy", e.target.value)} />
          ) : (
            <span className="font-semibold text-slate-700">{formData.preparedBy}</span>
          )}
        </div>
      </div>
    </div>
  );
}
