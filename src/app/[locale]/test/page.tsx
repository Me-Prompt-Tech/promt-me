'use client'

import { Plan } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function test() {
    //     model Plan {
    // id          String     @id @default(auto()) @map("_id") @db.ObjectId
    // name        String
    // description String?

    // priceSatang Int       @default(0)
    // maxUsers    Int?
    // maxDocuments Int?
    // maxStorageMb Int?

    // status      PlanStatus @default(ACTIVE)
    


    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priceSatang, setPriceSatang] = useState(0);
    const [maxUsers, setMaxUsers] = useState(0);
    const [maxDocuments, setMaxDocuments] = useState(0);
    const [maxStorageMb, setMaxStorageMb] = useState(0);
    const [status, setStatus] = useState('ACTIVE');
    // const handleUpdate = async () => {
    //     const response = await fetch('/api/plan', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             name,
    //             description,
    //             priceSatang,
    //             maxUsers,
    //             maxDocuments,
    //             maxStorageMb,
    //             status
    //         })
    //     });
    // };
    // post user
    function postUser() {
       console.log ('name', name); 
       console.log ('description', description);
       console.log (' priceSatang', priceSatang);
       console.log (' maxUsers', maxUsers);
       console.log ('  maxDocuments ', maxDocuments);
       console.log (' maxStorageMb ', maxStorageMb);
       console.log (' status ', status  );
    }

    return (
        <div className='p-6'>
            <h2 className='mb-4 text-xl font-semibold'>test</h2>
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    name : <input id="name" className='border' value={name} onChange={(e) => setName(e.target.value)} />
                </div>
               <div>
                    description : <input id="description" className='border' value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                    priceSatang : <input id="priceSatang" className='border' value={priceSatang} onChange={(e) => setPriceSatang(parseInt(e.target.value) || 0)} />
                </div>
                <div>
                    maxUsers : <input id="maxUsers" className='border' value={maxUsers} onChange={(e) => setMaxUsers(parseInt(e.target.value) || 0)} />
                </div>
                <div>
                    maxDocuments : <input id="maxDocuments" className='border' value={maxDocuments} onChange={(e) => setMaxDocuments(parseInt(e.target.value) || 0)} />
                </div>
                <div>
                    maxStorageMb : <input id="maxStorageMb" className='border' value={maxStorageMb} onChange={(e) => setMaxStorageMb(parseInt(e.target.value) || 0)} />
                </div>
            </div>

            <Button onClick={postUser} className='mt-4'>
                กดปุ่ม
            </Button>
        </div>
    )
}