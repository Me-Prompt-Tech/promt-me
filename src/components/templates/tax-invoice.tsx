"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

export type TaxInvoiceData = {
  customerName: string;
  customerAddress: string;
  customerTel: string;
  customerFax: string;
  customerTaxId: string;
  contactPerson: string;
  documentDate: string;
  documentNo: string;
  poNo: string;
  paymentTerm: string;
  dueDate: string;
  salesman: string;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>;
  vatRate: number; // usually 7
};

const emptyData: TaxInvoiceData = {
  customerName: "",
  customerAddress: "",
  customerTel: "",
  customerFax: "",
  customerTaxId: "",
  contactPerson: "",
  documentDate: new Date().toISOString().split("T")[0],
  documentNo: "",
  poNo: "",
  paymentTerm: "",
  dueDate: "",
  salesman: "",
  items: [{ description: "", quantity: 1, unit: "", unitPrice: 0 }],
  vatRate: 7,
};

export function TaxInvoiceTemplate({
  mode = "edit",
  data,
  onChange,
}: {
  mode?: "edit" | "view";
  data?: Partial<TaxInvoiceData>;
  onChange?: (data: TaxInvoiceData) => void;
}) {
  const [formData, setFormData] = useState<TaxInvoiceData>({ ...emptyData, ...data });

  // Update parent when form data changes
  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = (field: keyof TaxInvoiceData, value: any) => {
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
      items: [...prev.items, { description: "", quantity: 1, unit: "", unitPrice: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const subTotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const vatAmount = (subTotal * formData.vatRate) / 100;
  const totalAmount = subTotal + vatAmount;

  if (mode === "edit") {
    return (
      <div className="mx-auto w-[210mm] min-h-[297mm] space-y-8 bg-white p-[10mm] text-slate-900 shadow-md">
        <h2 className="text-xl font-bold text-slate-900">กรอกข้อมูล ใบกำกับภาษี / ใบส่งสินค้า</h2>
        
        {/* Customer & Document Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">ข้อมูลลูกค้า</h3>
            <label className="block text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">ชื่อลูกค้า (Customer Name)</span>
              <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.customerName} onChange={(e) => updateField("customerName", e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">ที่อยู่ (Address)</span>
              <textarea rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.customerAddress} onChange={(e) => updateField("customerAddress", e.target.value)} />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">โทรศัพท์ (Tel)</span>
                <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.customerTel} onChange={(e) => updateField("customerTel", e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">แฟกซ์ (Fax)</span>
                <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.customerFax} onChange={(e) => updateField("customerFax", e.target.value)} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">เลขประจำตัวผู้เสียภาษี (Tax ID)</span>
                <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.customerTaxId} onChange={(e) => updateField("customerTaxId", e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">ผู้ติดต่อ (Contact Person)</span>
                <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.contactPerson} onChange={(e) => updateField("contactPerson", e.target.value)} />
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">ข้อมูลเอกสาร</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">เลขที่ (No.)</span>
                <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.documentNo} onChange={(e) => updateField("documentNo", e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">วันที่ (Date)</span>
                <input type="date" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.documentDate} onChange={(e) => updateField("documentDate", e.target.value)} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">เลขที่ใบสั่งซื้อ (PO No.)</span>
                <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.poNo} onChange={(e) => updateField("poNo", e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">เงื่อนไขการชำระเงิน (Term)</span>
                <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.paymentTerm} onChange={(e) => updateField("paymentTerm", e.target.value)} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">วันครบกำหนด (Due Date)</span>
                <input type="date" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.dueDate} onChange={(e) => updateField("dueDate", e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">พนักงานขาย (Salesman)</span>
                <input type="text" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={formData.salesman} onChange={(e) => updateField("salesman", e.target.value)} />
              </label>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">รายการสินค้า</h3>
            <button type="button" onClick={addItem} className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400">
              <Plus className="size-4" /> เพิ่มรายการ
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2">รายละเอียด</th>
                  <th className="px-3 py-2 w-24">จำนวน</th>
                  <th className="px-3 py-2 w-24">หน่วย</th>
                  <th className="px-3 py-2 w-32">ราคา/หน่วย</th>
                  <th className="px-3 py-2 w-32">จำนวนเงิน</th>
                  <th className="px-3 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-1 py-2">
                      <input type="text" className="w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900" value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} />
                    </td>
                    <td className="px-1 py-2">
                      <input type="number" min="0" className="w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900 text-right" value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} />
                    </td>
                    <td className="px-1 py-2">
                      <input type="text" className="w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900" value={item.unit} onChange={(e) => updateItem(index, "unit", e.target.value)} />
                    </td>
                    <td className="px-1 py-2">
                      <input type="number" min="0" className="w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900 text-right" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      {(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-1 py-2 text-center">
                      <button type="button" onClick={() => removeItem(index)} className="text-rose-500 hover:bg-rose-50 p-1 rounded">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">รวมเงิน (Sub Total)</span>
                <span className="font-medium">{subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  ภาษีมูลค่าเพิ่ม (VAT) 
                  <input type="number" className="w-12 rounded border border-slate-300 px-1 py-0.5 text-center text-xs dark:border-slate-700 dark:bg-slate-900" value={formData.vatRate} onChange={(e) => updateField("vatRate", Number(e.target.value))} /> %
                </span>
                <span className="font-medium">{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-base font-bold text-teal-700 dark:text-teal-400">
                <span>จำนวนเงินรวมทั้งสิ้น</span>
                <span>{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View / Print Mode
  return (
    <div className="mx-auto w-[210mm] min-h-[297mm] bg-white p-[10mm] text-black shadow-md print:shadow-none print:w-auto print:h-auto print:min-h-0 print:p-0" style={{ fontFamily: "'Sarabun', sans-serif" }}>
      {/* Document Header Container */}
      <div className="flex justify-between items-start mb-6">
        
        {/* Left: Logo & Company Info */}
        <div className="flex gap-4">
          <div className="w-[80px] h-[80px] shrink-0 border-2 border-black rounded-full flex items-center justify-center flex-col p-1 text-center font-bold relative overflow-hidden">
             {/* Simple Logo Mockup matching the image */}
             <div className="text-[8px] leading-tight absolute top-1 left-0 right-0">RKT ENGINEERING & SERVICES CO.,LTD.</div>
             <div className="text-3xl mt-1 tracking-tighter">RKT</div>
             <div className="text-[5px] absolute bottom-2 left-0 right-0">บริษัท อาร์ เค ที เอ็นจิเนียริ่ง แอนด์ เซอร์วิส จำกัด</div>
          </div>
          
          <div className="text-[11px] leading-snug">
            <h1 className="text-xl font-bold text-black tracking-wide mb-1">บริษัท อาร์ เค ที เอ็นจิเนียริ่ง แอนด์ เซอร์วิส จำกัด</h1>
            <h2 className="text-[13px] font-bold mb-2">RKT ENGINEERING & SERVICES CO., LTD.</h2>
            <div className="grid grid-cols-[80px_1fr] gap-x-1">
              <span>สำนักงานใหญ่</span>
              <span>: 102/60 หมู่ที่ 3 ถนนปทุม-สามโคก ตำบลกระแซง อำเภอสามโคก จังหวัดปทุมธานี 12160</span>
              <span>Head Office</span>
              <span>: 102/60 Moo 3, Pathum-Samkhok Road, Tambol Krachaeng, Amphur Samkhok, Pathumthani 12160</span>
            </div>
            <div className="mt-1">
              <span className="mr-4">Tel : 0-2979-0114</span>
              <span className="mr-4">Fax : 0-2979-0115</span>
              <span>E-mail : info@rkt-engineering.com</span>
            </div>
          </div>
        </div>

        {/* Right: Original Badge & Tax ID */}
        <div className="flex flex-col items-center">
          <div className="border border-black rounded-full px-6 py-1 text-center w-40">
            <div className="font-bold text-sm">ต้นฉบับลูกค้า</div>
            <div className="text-[10px] font-bold">CUSTOMER ORIGINAL</div>
          </div>
          <div className="mt-4 text-xs font-bold whitespace-nowrap">เลขประจำตัวผู้เสียภาษีอากร</div>
          <div className="text-sm font-bold tracking-[3px] mt-1">0135550035587</div>
        </div>
      </div>

      {/* Invoice Title */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">ใบกำกับภาษี / ใบส่งสินค้า</h2>
        <h3 className="text-sm font-bold">TAX INVOICE ORIGINAL / DELIVERY ORDER</h3>
      </div>

      {/* Customer & Document Meta Block */}
      <div className="border border-black flex flex-row w-full text-[11px] leading-tight mb-2 h-32">
        {/* Customer Left */}
        <div className="w-[60%] p-2 flex flex-col justify-between">
          <div className="grid grid-cols-[120px_1fr] gap-1">
            <div>
              <div>ชื่อลูกค้า :</div>
              <div className="text-[9px]">CUSTOMER NAME</div>
            </div>
            <div className="font-bold">{formData.customerName}</div>
            
            <div className="mt-1">
              <div>ที่อยู่ :</div>
              <div className="text-[9px]">ADDRESS</div>
            </div>
            <div className="font-bold mt-1 leading-snug">{formData.customerAddress}</div>
          </div>

          <div className="grid grid-cols-[120px_1fr_60px_1fr] gap-1 mt-auto">
            <div>
              <div>โทรศัพท์ :</div>
              <div className="text-[9px]">TELEPHONE</div>
            </div>
            <div className="font-bold">{formData.customerTel}</div>
            
            <div>
              <div>โทรสาร :</div>
              <div className="text-[9px]">FAX</div>
            </div>
            <div className="font-bold">{formData.customerFax}</div>
            
            <div>
              <div>เลขประจำตัวผู้เสียภาษีอากร :</div>
              <div className="text-[9px]">TAX ID NO.</div>
            </div>
            <div className="font-bold">{formData.customerTaxId}</div>
            
            <div>
              <div>ชื่อผู้ติดต่อ :</div>
              <div className="text-[9px]">CONTACT PERSON</div>
            </div>
            <div className="font-bold">{formData.contactPerson}</div>
          </div>
        </div>
        
        {/* Meta Right */}
        <div className="w-[40%] border-l border-black flex flex-col">
          <div className="grid grid-cols-2 border-b border-black flex-1 items-center px-2">
            <div>
              <div>วันที่</div>
              <div className="text-[9px]">DATE</div>
            </div>
            <div className="font-bold text-center">{formData.documentDate ? new Date(formData.documentDate).toLocaleDateString('th-TH') : ''}</div>
          </div>
          <div className="grid grid-cols-2 border-b border-black flex-1 items-center px-2 bg-gray-50/50">
            <div>
              <div>เลขที่</div>
              <div className="text-[9px]">NO.</div>
            </div>
            <div className="font-bold text-center">{formData.documentNo}</div>
          </div>
          <div className="flex-1 px-2 py-1 border-b border-black">
            <div>เลขที่ใบสั่งซื้อ</div>
            <div className="text-[9px]">PO. NO.</div>
            <div className="font-bold mt-0.5">{formData.poNo}</div>
          </div>
          <div className="flex-1 px-2 py-1 border-b border-black">
            <div>เงื่อนไขการชำระเงิน</div>
            <div className="text-[9px]">PAYMENT TERM</div>
            <div className="font-bold mt-0.5">{formData.paymentTerm}</div>
          </div>
          <div className="flex-1 px-2 py-1 border-b border-black">
            <div>วันครบกำหนดชำระเงิน</div>
            <div className="text-[9px]">DUE DATE</div>
            <div className="font-bold mt-0.5">{formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('th-TH') : ''}</div>
          </div>
          <div className="flex-1 px-2 py-1">
            <div>พนักงานขาย</div>
            <div className="text-[9px]">SALE MAN</div>
            <div className="font-bold mt-0.5">{formData.salesman}</div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-black flex flex-col mb-2 text-[11px]">
        {/* Table Header */}
        <div className="flex border-b border-black text-center items-center bg-gray-50/50">
          <div className="w-[8%] py-1 border-r border-black">
            <div>ลำดับที่</div>
            <div className="text-[9px]">ITEM</div>
          </div>
          <div className="w-[45%] py-1 border-r border-black">
            <div>รายการ</div>
            <div className="text-[9px]">DESCRIPTION</div>
          </div>
          <div className="w-[10%] py-1 border-r border-black">
            <div>จำนวน</div>
            <div className="text-[9px]">QUANTITY</div>
          </div>
          <div className="w-[10%] py-1 border-r border-black">
            <div>หน่วย</div>
            <div className="text-[9px]">UNIT</div>
          </div>
          <div className="w-[12%] py-1 border-r border-black">
            <div>ราคาต่อหน่วย</div>
            <div className="text-[9px]">UNIT PRICE</div>
          </div>
          <div className="w-[15%] py-1">
            <div>จำนวนเงิน</div>
            <div className="text-[9px]">AMOUNT</div>
          </div>
        </div>
        
        {/* Table Body (Fixed Height for Invoice Layout) */}
        <div className="flex flex-row min-h-[300px] relative">
          <div className="w-[8%] border-r border-black h-full absolute left-0 top-0"></div>
          <div className="w-[45%] border-r border-black h-full absolute left-[8%] top-0"></div>
          <div className="w-[10%] border-r border-black h-full absolute left-[53%] top-0"></div>
          <div className="w-[10%] border-r border-black h-full absolute left-[63%] top-0"></div>
          <div className="w-[12%] border-r border-black h-full absolute left-[73%] top-0"></div>
          
          <div className="w-full flex flex-col z-10 py-2">
            {formData.items.map((item, idx) => (
              <div key={idx} className="flex flex-row w-full mb-1 px-1">
                <div className="w-[8%] text-center">{idx + 1}</div>
                <div className="w-[45%] px-2 font-bold whitespace-pre-wrap">{item.description}</div>
                <div className="w-[10%] text-center font-bold">{item.quantity}</div>
                <div className="w-[10%] text-center font-bold">{item.unit}</div>
                <div className="w-[12%] text-right px-2 font-bold">{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className="w-[15%] text-right px-2 font-bold">{(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Row */}
        <div className="flex border-t border-black">
          {/* Conditions */}
          <div className="w-[73%] p-2 text-[10px] leading-loose flex flex-col justify-center border-r border-black">
            <div>1. ได้รับสินค้าตามรายการข้างบนนี้ไว้ในสภาพดีและถูกต้องเรียบร้อยแล้ว</div>
            <div>2. สินค้าตามรายการข้างบนนี้ หากมีการเสียหายหรือชำรุด โปรดแจ้งกลับให้ทราบภายใน 3 วัน</div>
            <div>3. สินค้าซื้อแล้ว จะไม่รับคืน ยกเว้นแต่จะตกลงเป็นอย่างอื่น</div>
            <div>4. โปรดสั่งจ่ายเช็คขีดคร่อมในนาม "บริษัท อาร์ เค ที เอ็นจิเนียริ่ง แอนด์ เซอร์วิส จำกัด"</div>
          </div>
          
          {/* Summary */}
          <div className="w-[27%] flex flex-col">
            <div className="flex flex-1 border-b border-black">
              <div className="w-[44.4%] border-r border-black flex flex-col justify-center items-center py-1">
                <div>รวมเงิน</div>
                <div className="text-[9px]">SUB TOTAL</div>
              </div>
              <div className="w-[55.6%] flex items-center justify-end px-2 font-bold text-sm">
                {subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex flex-1 border-b border-black">
              <div className="w-[44.4%] border-r border-black flex flex-col justify-center items-center py-1">
                <div>ภาษีมูลค่าเพิ่ม</div>
                <div className="text-[9px]">VAT</div>
              </div>
              <div className="w-[55.6%] flex items-center justify-end px-2 font-bold text-sm">
                {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex flex-1">
              <div className="w-[44.4%] border-r border-black flex flex-col justify-center items-center py-1 bg-gray-50/50">
                <div>จำนวนเงินรวมทั้งสิ้น</div>
                <div className="text-[9px]">TOTAL AMOUNT</div>
              </div>
              <div className="w-[55.6%] flex items-center justify-end px-2 font-bold text-sm">
                {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="border border-black flex text-[10px] h-28">
        <div className="w-[66.66%] border-r border-black flex flex-col justify-between p-2">
          <div className="font-bold">ได้รับสินค้าตามรายการข้างบนนี้ถูกต้องแล้ว</div>
          <div className="flex justify-between items-end pb-1 px-8 text-center h-full pt-6">
            <div className="w-40 flex flex-col items-center">
              <div className="border-b border-dotted border-black w-full mb-1"></div>
              <div>( ..................................................... )</div>
              <div className="mt-1">ผู้รับของ / RECEIVED BY</div>
              <div className="mt-1">วันที่ ............/............/............</div>
            </div>
            <div className="w-40 flex flex-col items-center">
              <div className="border-b border-dotted border-black w-full mb-1"></div>
              <div>( ..................................................... )</div>
              <div className="mt-1">ผู้ส่งของ / DELIVERED BY</div>
              <div className="mt-1">วันที่ ............/............/............</div>
            </div>
          </div>
        </div>
        <div className="w-[33.34%] flex flex-col justify-between p-2">
          <div className="text-center">ในนาม บริษัท อาร์ เค ที เอ็นจิเนียริ่ง แอนด์ เซอร์วิส จำกัด</div>
          <div className="flex justify-center items-end pb-1 text-center h-full pt-6">
            <div className="w-48 flex flex-col items-center">
              <div className="border-b border-dotted border-black w-full mb-1"></div>
              <div>( ..................................................... )</div>
              <div className="mt-1">ผู้อนุมัติ / AUTHORIZED BY</div>
              <div className="mt-1">วันที่ ............/............/............</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
