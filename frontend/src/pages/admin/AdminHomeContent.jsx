import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminHomeContentService from '../../services/adminHomeContentService';
import './AdminHomeContent.css';

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ kind:'payment', title:'', subtitle:'', imageUrl:'', linkUrl:'', amount:'', showDate:today(), isActive:true, displayOrder:0 });

function AdminHomeContent() {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [editingId,setEditingId]=useState(null); const [form,setForm]=useState(emptyForm());
  const load=useCallback(async()=>{try{setLoading(true);const r=await adminHomeContentService.list();setItems(r.items||[]);}catch(e){toast.error(e.response?.data?.message||'Unable to load home content.')}finally{setLoading(false)}},[]);
  useEffect(()=>{load()},[load]);
  const reset=()=>{setEditingId(null);setForm(emptyForm())};
  const edit=(item)=>{setEditingId(item._id);setForm({kind:item.kind,title:item.title||'',subtitle:item.subtitle||'',imageUrl:item.imageUrl||'',linkUrl:item.linkUrl||'',amount:item.kind==='payment'?(Number(item.amountMinor||0)/100).toFixed(2):'',showDate:item.showDate||today(),isActive:item.isActive!==false,displayOrder:item.displayOrder||0});window.scrollTo({top:0,behavior:'smooth'})};
  const submit=async(e)=>{e.preventDefault();try{setSaving(true);const payload={...form,displayOrder:Number(form.displayOrder)||0,amount:form.kind==='payment'?Number(form.amount)||0:0};if(editingId){await adminHomeContentService.update(editingId,payload);toast.success('Home content updated.')}else{await adminHomeContentService.create(payload);toast.success('Home content added.')}reset();await load()}catch(e){toast.error(e.response?.data?.message||'Unable to save home content.')}finally{setSaving(false)}};
  const remove=async(item)=>{if(!window.confirm('Delete this home content?'))return;try{await adminHomeContentService.remove(item._id);toast.success('Deleted.');if(editingId===item._id)reset();await load()}catch(e){toast.error(e.response?.data?.message||'Unable to delete.')}};
  const toggle=async(item)=>{try{await adminHomeContentService.update(item._id,{isActive:!item.isActive});await load()}catch(e){toast.error(e.response?.data?.message||'Unable to update.')}};
  return <div className="admin-home-content">
    <section className="admin-page-header"><div><p className="admin-page-header__eyebrow">Homepage</p><h1>Home Content</h1><p>Manage the carousel and today's payment showcase.</p></div></section>
    <section className="admin-home-content__form"><div className="admin-home-content__form-header"><div><h2>{editingId?'Edit Content':'Add Content'}</h2><p>Use a public image URL for the banner or payment slip.</p></div>{editingId&&<button type="button" onClick={reset}>Cancel Edit</button>}</div>
      <form className="admin-home-form" onSubmit={submit}>
        <label>Type<select value={form.kind} onChange={e=>setForm({...form,kind:e.target.value,amount:e.target.value==='payment'?form.amount:''})}><option value="payment">Payment Slip</option><option value="banner">Carousel Banner</option></select></label>
        <label>Image URL<input type="url" required value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} placeholder="https://example.com/image.jpg"/></label>
        <div className="admin-home-form__grid"><label>Title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Display Order<input type="number" min="0" step="1" value={form.displayOrder} onChange={e=>setForm({...form,displayOrder:e.target.value})}/></label></div>
        <label>Subtitle<input value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})}/></label>
        {form.kind==='banner'&&<label>Link URL<input type="url" value={form.linkUrl} onChange={e=>setForm({...form,linkUrl:e.target.value})} placeholder="https://..."/></label>}
        {form.kind==='payment'&&<div className="admin-home-form__grid"><label>Payment / Earning Amount<input type="number" min="0" step="0.01" required value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="500.00"/></label><label>Show Date<input type="date" value={form.showDate} onChange={e=>setForm({...form,showDate:e.target.value})}/></label></div>}
        <label className="admin-home-form__checkbox"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})}/>Active</label>
        <button className="admin-home-form__submit" disabled={saving}>{saving?'Saving...':editingId?'Update Content':'Add Content'}</button>
      </form>
    </section>
    <section className="admin-home-content__list"><div className="admin-home-content__list-header"><div><h2>Existing Content</h2><span>{items.length} items</span></div><button type="button" onClick={load}>Refresh</button></div>
      {loading?<div className="admin-home-empty">Loading...</div>:items.length===0?<div className="admin-home-empty">No homepage content yet.</div>:<div className="admin-home-content__table">{items.map(item=><article className="admin-home-item" key={item._id}><div className="admin-home-item__image"><img src={item.imageUrl} alt={item.title||item.kind}/></div><div className="admin-home-item__main"><div className="admin-home-item__badges"><span>{item.kind==='payment'?'Payment':'Banner'}</span><span>Order {item.displayOrder}</span>{!item.isActive&&<span>Disabled</span>}</div><h3>{item.title||'Untitled'}</h3><p>{item.kind==='payment'?`Amount: ${(Number(item.amountMinor||0)/100).toFixed(2)} · Date: ${item.showDate||'Every day'}`:(item.subtitle||'Carousel banner')}</p></div><div className="admin-home-item__actions"><button type="button" onClick={()=>toggle(item)}>{item.isActive?'Disable':'Enable'}</button><button type="button" onClick={()=>edit(item)}>Edit</button><button type="button" className="danger" onClick={()=>remove(item)}>Delete</button></div></article>)}</div>}
    </section>
  </div>;
}
export default AdminHomeContent;
