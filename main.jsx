import React,{useEffect,useState} from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter,Routes,Route,Link,useParams} from "react-router-dom";
import {Home,Search,MapPin,Phone,MessageCircle,RefreshCw,ChevronLeft} from "lucide-react";
import {supabase} from "./supabase";
import "./styles.css";

const labels={trong:"Đang trống",sap_trong:"Sắp trống",da_thue:"Đã thuê",ngung:"Ngừng cho thuê"};
const money=v=>v==null?"Liên hệ":new Intl.NumberFormat("vi-VN").format(v)+" đ/tháng";

function App(){
 return <BrowserRouter><header><div className="nav wrap">
  <Link to="/" className="brand"><span className="logo"><Home size={21}/></span><span><b>An Cư Lập Nghiệp 365</b><small>Phòng trọ • Nhà ở • An cư</small></span></Link>
  <Link to="/admin" className="admin">Quản lý</Link>
 </div></header>
 <Routes><Route path="/" element={<Rooms/>}/><Route path="/phong/:code" element={<Detail/>}/><Route path="/admin" element={<Admin/>}/></Routes>
 <footer>© {new Date().getFullYear()} An Cư Lập Nghiệp 365</footer></BrowserRouter>
}

function Rooms(){
 const [rooms,setRooms]=useState([]),[q,setQ]=useState(""),[loading,setLoading]=useState(true),[err,setErr]=useState("");
 const load=async()=>{setLoading(true);const {data,error}=await supabase.from("rooms").select("*").order("code");if(error)setErr(error.message);else setRooms(data||[]);setLoading(false)};
 useEffect(()=>{load()},[]);
 const list=rooms.filter(r=>`${r.code} ${r.khu_vuc} ${r.dia_chi} ${r.loai_hinh}`.toLowerCase().includes(q.toLowerCase()));
 return <main><section className="hero"><div className="wrap"><div className="eyebrow">AN CƯ • LẬP NGHIỆP • 365</div><h1>Tìm một nơi ở<br/><em>để an cư, để lập nghiệp.</em></h1><p>Thông tin phòng được quản lý tập trung và cập nhật theo từng căn.</p><div className="search"><Search size={20}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm mã phòng, khu vực, địa chỉ..."/></div></div></section>
 <section className="wrap content"><div className="tools"><b>Danh sách phòng</b><button onClick={load}><RefreshCw size={17}/> Tải lại</button></div>
 {loading?<div className="state">Đang tải danh sách phòng…</div>:err?<div className="error">{err}<br/><small>Nếu bảng rooms đang bật RLS, xem file supabase.sql.</small></div>:list.length===0?<div className="state">Chưa có phòng phù hợp.</div>:<div className="grid">{list.map(r=><Card key={r.id} r={r}/>)}</div>}</section></main>
}

function Card({r}){return <Link className="card" to={"/phong/"+encodeURIComponent(r.code)}><div className="photo"><Home size={38}/><b>{r.code}</b></div><div className="body"><div className="line"><b>{r.code}</b><span className={"badge "+r.trang_thai}>{labels[r.trang_thai]||r.trang_thai}</span></div><h3>{r.loai_hinh||"Phòng trọ"}</h3><div className="muted"><MapPin size={15}/>{r.dia_chi||r.khu_vuc||"Chưa cập nhật địa chỉ"}</div><div className="facts">{r.dien_tich&&<span>{r.dien_tich} m²</span>}{r.tang&&<span>Tầng {r.tang}</span>}</div><div className="price">{money(r.gia_thue)}</div></div></Link>}

function Detail(){
 const {code}=useParams();const [r,setR]=useState();const [err,setErr]=useState("");
 useEffect(()=>{supabase.from("rooms").select("*").eq("code",code).maybeSingle().then(({data,error})=>{setR(data);if(error)setErr(error.message)})},[code]);
 if(err)return <div className="wrap state">{err}</div>; if(!r)return <div className="wrap state">Đang tải…</div>;
 return <main className="wrap detail"><Link to="/" className="back"><ChevronLeft size={18}/> Danh sách phòng</Link><div className="detailbox"><div className="bigphoto"><Home size={70}/><b>{r.code}</b></div><div><span className={"badge "+r.trang_thai}>{labels[r.trang_thai]||r.trang_thai}</span><h1>{r.loai_hinh||"Phòng trọ"}</h1><div className="muted"><MapPin size={18}/>{r.dia_chi||r.khu_vuc}</div><div className="detailprice">{money(r.gia_thue)}</div><div className="facts big">{r.dien_tich&&<div><small>Diện tích</small><b>{r.dien_tich} m²</b></div>}{r.tang&&<div><small>Tầng</small><b>{r.tang}</b></div>}{r.tien_coc&&<div><small>Tiền cọc</small><b>{new Intl.NumberFormat("vi-VN").format(r.tien_coc)} đ</b></div>}</div>{r.mo_ta&&<p className="desc">{r.mo_ta}</p>}{r.noi_that&&<p><b>Nội thất:</b> {r.noi_that}</p>}<div className="actions">{r.so_dien_thoai&&<a href={"tel:"+r.so_dien_thoai}><Phone size={18}/> Gọi ngay</a>}{r.so_zalo&&<a href={"https://zalo.me/"+r.so_zalo} target="_blank" rel="noreferrer"><MessageCircle size={18}/> Zalo</a>}</div></div></div></main>
}

function Admin(){
 const [rooms,setRooms]=useState([]),[msg,setMsg]=useState("");
 const load=async()=>{const {data,error}=await supabase.from("rooms").select("*").order("code");if(error)setMsg(error.message);else setRooms(data||[])};useEffect(()=>{load()},[]);
 const update=async(id,v)=>{const {error}=await supabase.from("rooms").update({trang_thai:v}).eq("id",id);if(error)setMsg(error.message);else load()};
 return <main className="wrap adminpage"><h1>Quản lý phòng</h1><p>Bản quản trị tạm thời kết nối trực tiếp Supabase.</p>{msg&&<div className="error">{msg}</div>}<div className="table">{rooms.map(r=><div className="tr" key={r.id}><div><b>{r.code}</b><small>{r.dia_chi||r.khu_vuc||""}</small></div><select value={r.trang_thai||""} onChange={e=>update(r.id,e.target.value)}><option value="trong">Đang trống</option><option value="sap_trong">Sắp trống</option><option value="da_thue">Đã thuê</option><option value="ngung">Ngừng</option></select></div>)}</div></main>
}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);