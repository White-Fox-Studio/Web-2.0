// /api/crm.js - СОХРАНЕНИЕ ДАННЫХ КАК НА КАРТИНКЕ
// Получаем переменные окружения
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const orderData = req.body;
        
        console.log('═══════════════════════════════════════');
        console.log('🛒 НОВЫЙ ЗАКАЗ В CRM');
        console.log('═══════════════════════════════════════');
        
        const FLOW_CLIENT_ID = process.env.FLOW_CLIENT_ID;
        const FLOW_CLIENT_SECRET = process.env.FLOW_CLIENT_SECRET;
        
        if (!FLOW_CLIENT_ID || !FLOW_CLIENT_SECRET) {
            throw new Error('FlowAccount credentials not configured');
        }

        // 1️⃣ ПОЛУЧАЕМ ТОКЕН
        console.log('3️⃣ Запрашиваем токен...');
        
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', FLOW_CLIENT_ID);
        params.append('client_secret', FLOW_CLIENT_SECRET);
        params.append('scope', 'flowaccount-api');
        
        const tokenResponse = await fetch('https://openapi.flowaccount.com/test/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        console.log('4️⃣ Токен получен');

        // ===================== ДАННЫЕ КЛИЕНТА =====================
        // Parent Information
        const parentName = (orderData.customer.name || '').trim();
        const phone = (orderData.customer.phone || '').trim();
        const lineId = (orderData.customer.line_id || '').trim();
        const email = (orderData.customer.email || '').trim();

        // Student Information
        const studentFirst = (orderData.customer.student_first_name || '').trim();
        const studentLast = (orderData.customer.student_last_name || '').trim();
        const birthdate = orderData.customer.birthdate || '';
        const school = (orderData.customer.school || '').trim();
        const classGrade = (orderData.customer.class_grade || '').trim();
        const program = (orderData.customer.program || 'Regular').trim();

        const studentName = `${studentFirst} ${studentLast}`.trim();
        
        // Проверяем наличие скидки
        const hasDiscount = orderData.order.discount_applied === 10;
        
        console.log(`5️⃣ Parent: ${parentName}`);
        console.log(`5️⃣ Phone: ${phone}`);
        console.log(`5️⃣ Line: ${lineId || 'не указан'}`);
        console.log(`5️⃣ Email: ${email || 'не указан'}`);
        console.log(`5️⃣ Student: ${studentName}`);
        console.log(`5️⃣ Birth: ${birthdate}`);
        console.log(`5️⃣ School: ${school}`);
        console.log(`5️⃣ Class: ${classGrade}`);
        console.log(`5️⃣ Program: ${program}`);

        // ===================== КАТЕГОРИИ =====================
        const categoryMapping = {
            'package': 'Q',
            'acrylic': 'A',
            'float': 'W',
            'canvas': 'C',
            'frame': 'F',
            'photobook': 'B',
            'calendar': 'K',
            'bottle': 'D',
            'photogifts': 'S',
            'accessory': 'E',
            'photoX': 'X',
            'prints': 'P'
        };

        // ===================== PRODUCT ID ИЗ CRM =====================
        const crmProducts = {
            "Q1": { "productId": 0, "productListId": 0, "category": "Q" },
            "Q2": { "productId": 0, "productListId": 0, "category": "Q" },
            "Q3": { "productId": 0, "productListId": 0, "category": "Q" },
            "A11": { "productId": 609095, "productListId": 609095, "category": "A" },
            "A12": { "productId": 0, "productListId": 0, "category": "A" },
            "A13": { "productId": 0, "productListId": 0, "category": "A" },
            "A14": { "productId": 0, "productListId": 0, "category": "A" },
            "W11": { "productId": 0, "productListId": 0, "category": "W" },
            "W12": { "productId": 0, "productListId": 0, "category": "W" },
            "W13": { "productId": 0, "productListId": 0, "category": "W" },
            "W14": { "productId": 0, "productListId": 0, "category": "W" },
            "W15": { "productId": 0, "productListId": 0, "category": "W" },
            "W16": { "productId": 0, "productListId": 0, "category": "W" },
            "W17": { "productId": 0, "productListId": 0, "category": "W" },
            "C11": { "productId": 0, "productListId": 0, "category": "C" },
            "C12": { "productId": 0, "productListId": 0, "category": "C" },
            "C13": { "productId": 0, "productListId": 0, "category": "C" },
            "C14": { "productId": 0, "productListId": 0, "category": "C" },
            "C15": { "productId": 0, "productListId": 0, "category": "C" },
            "F11": { "productId": 0, "productListId": 0, "category": "F" },
            "F12": { "productId": 0, "productListId": 0, "category": "F" },
            "F13": { "productId": 0, "productListId": 0, "category": "F" },
            "F14": { "productId": 0, "productListId": 0, "category": "F" },
            "F15": { "productId": 0, "productListId": 0, "category": "F" },
            "B11": { "productId": 0, "productListId": 0, "category": "B" },
            "B12": { "productId": 0, "productListId": 0, "category": "B" },
            "B13": { "productId": 0, "productListId": 0, "category": "B" },
            "B14": { "productId": 0, "productListId": 0, "category": "B" },
            "K11": { "productId": 0, "productListId": 0, "category": "K" },
            "K12": { "productId": 0, "productListId": 0, "category": "K" },
            "K13": { "productId": 0, "productListId": 0, "category": "K" },
            "K14": { "productId": 0, "productListId": 0, "category": "K" },
            "K15": { "productId": 0, "productListId": 0, "category": "K" },
            "K16": { "productId": 0, "productListId": 0, "category": "K" },
            "D11": { "productId": 0, "productListId": 0, "category": "D" },
            "D12": { "productId": 0, "productListId": 0, "category": "D" },
            "D13": { "productId": 0, "productListId": 0, "category": "D" },
            "D14": { "productId": 0, "productListId": 0, "category": "D" },
            "S11": { "productId": 0, "productListId": 0, "category": "S" },
            "S12": { "productId": 0, "productListId": 0, "category": "S" },
            "S13": { "productId": 0, "productListId": 0, "category": "S" },
            "S14": { "productId": 0, "productListId": 0, "category": "S" },
            "S15": { "productId": 0, "productListId": 0, "category": "S" },
            "S16": { "productId": 0, "productListId": 0, "category": "S" },
            "S17": { "productId": 0, "productListId": 0, "category": "S" },
            "E11": { "productId": 0, "productListId": 0, "category": "E" },
            "E12": { "productId": 0, "productListId": 0, "category": "E" },
            "E13": { "productId": 0, "productListId": 0, "category": "E" },
            "E14": { "productId": 0, "productListId": 0, "category": "E" },
            "E15": { "productId": 0, "productListId": 0, "category": "E" },
            "E16": { "productId": 0, "productListId": 0, "category": "E" },
            "E17": { "productId": 0, "productListId": 0, "category": "E" },
            "E18": { "productId": 0, "productListId": 0, "category": "E" },
            "E19": { "productId": 0, "productListId": 0, "category": "E" },
            "E20": { "productId": 0, "productListId": 0, "category": "E" },
            "X11": { "productId": 0, "productListId": 0, "category": "X" },
            "X12": { "productId": 0, "productListId": 0, "category": "X" },
            "X13": { "productId": 0, "productListId": 0, "category": "X" },
            "X14": { "productId": 0, "productListId": 0, "category": "X" },
            "P11": { "productId": 0, "productListId": 0, "category": "P" },
            "P12": { "productId": 0, "productListId": 0, "category": "P" },
            "P13": { "productId": 0, "productListId": 0, "category": "P" },
            "P14": { "productId": 0, "productListId": 0, "category": "P" },
            "P15": { "productId": 0, "productListId": 0, "category": "P" },
            "P16": { "productId": 0, "productListId": 0, "category": "P" },
            "P17": { "productId": 0, "productListId": 0, "category": "P" },
            "P18": { "productId": 0, "productListId": 0, "category": "P" }
        };

        // Группируем товары
        const groupedItems = [];
        const itemMap = new Map();
        
        orderData.order.items.forEach(item => {
            if (itemMap.has(item.sku)) {
                const existing = itemMap.get(item.sku);
                existing.quantity += item.quantity;
                existing.total = existing.price * existing.quantity;
            } else {
                const crmProduct = crmProducts[item.sku] || { 
                    productId: null, 
                    productListId: null,
                    category: categoryMapping[item.category] || 'X'
                };
                
                const newItem = {
                    sku: item.sku,
                    name: (item.name || '').substring(0, 100),
                    price: item.price,
                    quantity: item.quantity,
                    total: item.price * item.quantity,
                    category: crmProduct.category,
                    productId: crmProduct.productId,
                    productListId: crmProduct.productListId
                };
                itemMap.set(item.sku, newItem);
                groupedItems.push(newItem);
            }
        });

        console.log(`6️⃣ Товаров в заказе: ${groupedItems.length} уникальных`);

        const grandTotal = orderData.order.total_amount;

        // ===================== ФОРМИРУЕМ ДАННЫЕ ДЛЯ CRM =====================
        
        // Contact Information (как на картинке)
        const contactInfo = {
            // Основные поля контакта
            "contactType": "client",                    // Client
            "businessType": "individual",                // Individual
            "creditDays": 30,                            // Credit (Days)
            "businessLocation": "phuket",                 // Business Location
            "contactId": "",                              // Contact ID (можно сгенерировать)
            "fullName": parentName,                       // Full Name родителя
            "identificationNo": birthdate.replace(/\D/g, '').substring(0, 13), // Identification No. (дата рождения как ID)
            "branch": "head_office",                       // Branch
            "address": school,                             // Address (школа)
            "zipCode": classGrade,                          // Zip Code (класс)
            "phone": phone,                                 // Phone
            "faxNumber": "",                                // Fax Number
            "website": ""                                   // Website
        };

        // Contact Person Detail (как на картинке)
        const contactPersonDetail = {
            "contactName": studentName,                    // Contact Name (имя ученика)
            "email": email,                                 // Email
            "mobile": phone                                 // Mobile (телефон родителя)
        };

        // Bank Information (пустое, можно заполнить позже)
        const bankInfo = {
            "bank": "",
            "accountName": "",
            "accountNumber": "",
            "branchCode": "",
            "accountType": "savings",
            "qrPayment": ""
        };

        // More Information For Foreign Bank (пустое)
        const foreignBankInfo = {
            "swiftCode": "",
            "bankAddress": ""
        };

        // Additional Information
        const additionalInfo = {
            "attachedFiles": [],
            "notes": `
═══════════════════════════════════════
STUDENT DETAILS
═══════════════════════════════════════
First Name: ${studentFirst}
Last Name: ${studentLast}
Birth Date: ${birthdate}
School: ${school}
Class: ${classGrade}
Program: ${program}

═══════════════════════════════════════
PARENT DETAILS
═══════════════════════════════════════
Name: ${parentName}
Phone: ${phone}
Line ID: ${lineId || 'Not specified'}
Email: ${email || 'Not specified'}

═══════════════════════════════════════
ORDER DETAILS
═══════════════════════════════════════
${groupedItems.map(item => `• ${item.sku} x${item.quantity} = ${item.total} THB`).join('\n')}
Total: ${grandTotal} THB
Discount: ${hasDiscount ? '10%' : 'No'}
            `.trim()
        };

        // Подготавливаем товары для CRM
        const items = groupedItems.map(item => {
            const itemData = {
                "name": `${item.sku} - ${item.name}`.substring(0, 255),
                "description": studentName,
                "quantity": item.quantity,
                "pricePerUnit": item.price,
                "total": item.total
            };
            
            if (item.productId && item.productListId) {
                itemData["productId"] = item.productId;
                itemData["productListId"] = item.productListId;
                console.log(`   ✅ Товар ${item.sku} привязан к ID: ${item.productId}`);
            } else {
                console.log(`   ⚠️ Товар ${item.sku} будет создан как новый`);
            }
            
            return itemData;
        });

        // СОЗДАЁМ BILLING NOTE
        const url = 'https://openapi.flowaccount.com/test/billing-notes';
        
        const invoiceData = {
            "documentType": 5,
            
            // Contact Information
            "contactName": parentName,
            "contactPerson": studentName,
            "contactAddress": school,
            "contactPhone": phone,
            "contactEmail": email,
            "contactZipCode": classGrade,
            "contactBranch": program,
            
            // Contact Type и Business Type
            "contactType": "client",
            "businessType": "individual",
            "creditDays": 30,
            "businessLocation": "phuket",
            
            // Bank Information (опционально)
            "bankAccount": {
                "bank": "",
                "accountName": "",
                "accountNumber": "",
                "branchCode": "",
                "accountType": "savings"
            },
            
            "publishedOn": new Date().toISOString().split('T')[0],
            "dueDate": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "items": items,
            "subTotal": grandTotal,
            "grandTotal": grandTotal,
            "isVat": false,
            "vatRate": 0,
            "notes": additionalInfo.notes,
            "useInlineDiscount": false,
            "useInlineVat": false,
            "exemptAmount": grandTotal,
            "vatableAmount": 0
        };

        console.log(`7️⃣ Отправляем заказ в CRM...`);

        const invoiceResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(invoiceData)
        });

        const responseText = await invoiceResponse.text();
        console.log(`8️⃣ Статус: ${invoiceResponse.status}`);

        if (!invoiceResponse.ok) {
            throw new Error(`HTTP error ${invoiceResponse.status}: ${responseText}`);
        }

        const responseData = JSON.parse(responseText);
        
        console.log(`✅ Заказ создан: ${responseData.data?.documentSerial}`);
        console.log('═══════════════════════════════════════');
        
        return res.status(200).json({
            success: true,
            message: '✅ Заказ отправлен в FlowAccount',
            document_serial: responseData.data?.documentSerial,
            document_id: responseData.data?.recordId
        });

    } catch (error) {
        console.error('❌ Ошибка:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
