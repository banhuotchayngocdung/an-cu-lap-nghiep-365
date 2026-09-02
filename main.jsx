import React,{useEffect,useState} from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams
} from "react-router-dom";

import {
  Home,
  Search,
  MapPin,
  Phone,
  MessageCircle,
  RefreshCw,
  ChevronLeft
} from "lucide-react";

import {supabase} from "./supabase";
import "./styles.css";


const labels = {
  trong:"Đang trống",
  sap_trong:"Sắp trống",
  da_thue:"Đã thuê",
  ngung:"Ngừng cho thuê"
};


const money = v =>
  v == null
    ? "Liên hệ"
    : new Intl.NumberFormat("vi-VN").format(v)+" đ/tháng";


/* =========================
   APP
========================= */

function App(){

  return (
    <BrowserRouter>

      <header>
        <div className="nav wrap">

          <Link to="/" className="brand">

            <span className="logo">
              <Home size={21}/>
            </span>

            <span>
              <b>An Cư Lập Nghiệp 365</b>
              <small>
                Phòng trọ • Nhà ở • An cư
              </small>
            </span>

          </Link>

          <Link to="/admin" className="admin">
            Quản lý
          </Link>

        </div>
      </header>


      <Routes>

        <Route
          path="/"
          element={<Rooms/>}
        />

        <Route
          path="/phong/:code"
          element={<Detail/>}
        />

        <Route
  path="/admin"
  element={<AdminGate/>}
/>

      </Routes>


      <footer>
        © {new Date().getFullYear()} An Cư Lập Nghiệp 365
      </footer>

    </BrowserRouter>
  );
}


/* =========================
   DANH SÁCH PHÒNG
========================= */

function Rooms(){

  const [rooms,setRooms] = useState([]);
  const [q,setQ] = useState("");
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState("");


  const load = async () => {

    setLoading(true);
    setErr("");

    const {data,error} = await supabase
      .from("rooms")
      .select("*")
      .order("code");


    if(error){

      setErr(error.message);

    }else{

      setRooms(data || []);

    }

    setLoading(false);
  };


  useEffect(()=>{
    load();
  },[]);


  const list = rooms.filter(r =>
    `${r.code} ${r.khu_vuc} ${r.dia_chi} ${r.loai_hinh}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );


  return (

    <main>

      <section className="hero">

        <div className="wrap">

          <div className="eyebrow">
            AN CƯ • LẬP NGHIỆP • 365
          </div>

          <h1>
            Tìm một nơi ở
            <br/>
            <em>để an cư, để lập nghiệp.</em>
          </h1>

          <p>
            Thông tin phòng được quản lý tập trung
            và cập nhật theo từng căn.
          </p>


          <div className="search">

            <Search size={20}/>

            <input
              value={q}
              onChange={e=>setQ(e.target.value)}
              placeholder="Tìm mã phòng, khu vực, địa chỉ..."
            />

          </div>

        </div>

      </section>


      <section className="wrap content">

        <div className="tools">

          <b>
            Danh sách phòng
          </b>

          <button onClick={load}>
            <RefreshCw size={17}/>
            Tải lại
          </button>

        </div>


        {loading && (

          <div className="state">
            Đang tải danh sách phòng…
          </div>

        )}


        {!loading && err && (

          <div className="error">

            {err}

            <br/>

            <small>
              Kiểm tra quyền SELECT của bảng rooms.
            </small>

          </div>

        )}


        {!loading && !err && list.length === 0 && (

          <div className="state">
            Chưa có phòng phù hợp.
          </div>

        )}


        {!loading && !err && list.length > 0 && (

          <div className="grid">

            {list.map(r => (
              <Card
                key={r.id}
                r={r}
              />
            ))}

          </div>

        )}

      </section>

    </main>

  );

}


/* =========================
   CARD PHÒNG
========================= */

function Card({r}){

  return (

    <Link
      className="card"
      to={"/phong/"+encodeURIComponent(r.code)}
    >

      <div className="photo">

        <Home size={38}/>

        <b>
          {r.code}
        </b>

      </div>


      <div className="body">

        <div className="line">

          <b>
            {r.code}
          </b>

          <span
            className={"badge "+r.trang_thai}
          >
            {labels[r.trang_thai] || r.trang_thai}
          </span>

        </div>


        <h3>
          {r.loai_hinh || "Phòng trọ"}
        </h3>


        <div className="muted">

          <MapPin size={15}/>

          {r.dia_chi ||
           r.khu_vuc ||
           "Chưa cập nhật địa chỉ"}

        </div>


        <div className="facts">

          {r.dien_tich && (
            <span>
              {r.dien_tich} m²
            </span>
          )}

          {r.tang && (
            <span>
              Tầng {r.tang}
            </span>
          )}

        </div>


        <div className="price">
          {money(r.gia_thue)}
        </div>

      </div>

    </Link>

  );

}


/* =========================
   CHI TIẾT PHÒNG
========================= */

function Detail(){

  const {code} = useParams();

  const [r,setR] = useState(null);
  const [err,setErr] = useState("");


  useEffect(()=>{

    supabase
      .from("rooms")
      .select("*")
      .eq("code",code)
      .maybeSingle()

      .then(({data,error})=>{

        if(error){

          setErr(error.message);

        }else{

          setR(data);

        }

      });

  },[code]);


  if(err){

    return (
      <div className="wrap state">
        {err}
      </div>
    );

  }


  if(!r){

    return (
      <div className="wrap state">
        Đang tải…
      </div>
    );

  }


  return (

    <main className="wrap detail">

      <Link
        to="/"
        className="back"
      >
        <ChevronLeft size={18}/>
        Danh sách phòng
      </Link>


      <div className="detailbox">

        <div className="bigphoto">

          <Home size={70}/>

          <b>
            {r.code}
          </b>

        </div>


        <div>

          <span
            className={"badge "+r.trang_thai}
          >
            {labels[r.trang_thai] || r.trang_thai}
          </span>


          <h1>
            {r.loai_hinh || "Phòng trọ"}
          </h1>


          <div className="muted">

            <MapPin size={18}/>

            {r.dia_chi || r.khu_vuc}

          </div>


          <div className="detailprice">
            {money(r.gia_thue)}
          </div>


          <div className="facts big">

            {r.dien_tich && (

              <div>
                <small>Diện tích</small>
                <b>{r.dien_tich} m²</b>
              </div>

            )}


            {r.tang && (

              <div>
                <small>Tầng</small>
                <b>{r.tang}</b>
              </div>

            )}


            {r.tien_coc && (

              <div>
                <small>Tiền cọc</small>

                <b>
                  {
                    new Intl.NumberFormat("vi-VN")
                      .format(r.tien_coc)
                  } đ
                </b>

              </div>

            )}

          </div>


          {r.mo_ta && (

            <p className="desc">
              {r.mo_ta}
            </p>

          )}


          {r.noi_that && (

            <p>
              <b>Nội thất:</b>{" "}
              {r.noi_that}
            </p>

          )}


          <div className="actions">

            {r.so_dien_thoai && (

              <a
                href={"tel:"+r.so_dien_thoai}
              >
                <Phone size={18}/>
                Gọi ngay
              </a>

            )}


            {r.so_zalo && (

              <a
                href={"https://zalo.me/"+r.so_zalo}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18}/>
                Zalo
              </a>

            )}

          </div>

        </div>

      </div>

    </main>

  );

}


/* =========================
   ĐĂNG NHẬP ADMIN
========================= */

function AdminLogin(){

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);


  const login = async e => {

    e.preventDefault();

    setLoading(true);
    setError("");


    const {error} =
      await supabase.auth.signInWithPassword({

        email,
        password

      });


    if(error){

      setError(
        "Email hoặc mật khẩu không đúng."
      );

    }else{

      window.location.href="/admin";

    }


    setLoading(false);

  };


  return (

    <main className="wrap adminpage">

      <h1>
        Đăng nhập quản lý
      </h1>

      <p>
        Chỉ tài khoản quản trị mới có thể
        cập nhật thông tin phòng.
      </p>


      <form
        onSubmit={login}
        className="admin-login"
      >

        <input
          type="email"
          placeholder="Email quản trị"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
        />


        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          required
        />


        {error && (

          <div className="error">
            {error}
          </div>

        )}


        <button
          type="submit"
          disabled={loading}
        >

          {loading
            ? "Đang đăng nhập…"
            : "Đăng nhập"}

        </button>

      </form>

    </main>

  );

}
/* =========================
   KIỂM TRA ĐĂNG NHẬP ADMIN
========================= */

function AdminGate(){

  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const checkUser = async()=>{

      const {data} = await supabase.auth.getUser();

      setUser(data.user || null);
      setLoading(false);

    };

    checkUser();

  },[]);

  if(loading){

    return (
      <main className="wrap adminpage">
        <div className="state">
          Đang kiểm tra đăng nhập…
        </div>
      </main>
    );

  }

  if(!user){

    return <AdminLogin/>;

  }

  return <Admin/>;

}


/* =========================
   ADMIN
========================= */

function Admin(){
  const [rooms,setRooms]=useState([]);
  const [msg,setMsg]=useState("");
  const [editing,setEditing]=useState(null);
  const [saving,setSaving]=useState(false);

  const load=async()=>{
    setMsg("");

    const {data,error}=await supabase
      .from("rooms")
      .select("*")
      .order("code");

    if(error){
      setMsg(error.message);
    }else{
      setRooms(data||[]);
    }
  };

  useEffect(()=>{
    load();
  },[]);

  const editRoom=(r)=>{
    setEditing({...r});
    setMsg("");
  };

  const saveRoom=async()=>{
    if(!editing) return;

    setSaving(true);
    setMsg("");

    const {error}=await supabase
      .from("rooms")
      .update({
        code: editing.code,
        khu_vuc: editing.khu_vuc,
        dia_chi: editing.dia_chi,
        loai_hinh: editing.loai_hinh,
        gia_thue: editing.gia_thue
          ? Number(editing.gia_thue)
          : null,
        tien_coc: editing.tien_coc
          ? Number(editing.tien_coc)
          : null,
        dien_tich: editing.dien_tich
          ? Number(editing.dien_tich)
          : null,
        tang: editing.tang
          ? Number(editing.tang)
          : null,
        mo_ta: editing.mo_ta,
        noi_that: editing.noi_that,
        so_dien_thoai: editing.so_dien_thoai,
        so_zalo: editing.so_zalo,
        trang_thai: editing.trang_thai
      })
      .eq("id",editing.id);

    setSaving(false);

    if(error){
      setMsg(error.message);
      return;
    }

    setMsg("✅ Đã lưu thông tin phòng.");

    setEditing(null);

    load();
  };

  return (
    <main className="wrap adminpage">

      <h1>Quản lý phòng</h1>

      <p>
        Đang đăng nhập: <b>tài khoản quản trị</b>
      </p>

      {msg && (
        <div className="error">
          {msg}
        </div>
      )}

      {!editing && (
        <div className="table">

          {rooms.map(r=>(
            <div className="tr" key={r.id}>

              <div>
                <b>{r.code}</b>

                <small>
                  {r.dia_chi || r.khu_vuc || ""}
                </small>
              </div>

              <div>
                <span className={"badge "+r.trang_thai}>
                  {labels[r.trang_thai] || r.trang_thai}
                </span>

                <button
                  onClick={()=>editRoom(r)}
                  style={{marginLeft:"10px"}}
                >
                  Sửa
                </button>
              </div>

            </div>
          ))}

        </div>
      )}

      {editing && (
        <div className="editbox">

          <h2>Sửa phòng {editing.code}</h2>

          <label>
            Mã phòng
            <input
              value={editing.code || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  code:e.target.value
                })
              }
            />
          </label>

          <label>
            Khu vực
            <input
              value={editing.khu_vuc || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  khu_vuc:e.target.value
                })
              }
            />
          </label>

          <label>
            Địa chỉ
            <input
              value={editing.dia_chi || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  dia_chi:e.target.value
                })
              }
            />
          </label>

          <label>
            Loại hình
            <input
              value={editing.loai_hinh || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  loai_hinh:e.target.value
                })
              }
            />
          </label>

          <label>
            Giá thuê
            <input
              type="number"
              value={editing.gia_thue || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  gia_thue:e.target.value
                })
              }
            />
          </label>

          <label>
            Tiền cọc
            <input
              type="number"
              value={editing.tien_coc || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  tien_coc:e.target.value
                })
              }
            />
          </label>

          <label>
            Diện tích (m²)
            <input
              type="number"
              value={editing.dien_tich || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  dien_tich:e.target.value
                })
              }
            />
          </label>

          <label>
            Tầng
            <input
              type="number"
              value={editing.tang || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  tang:e.target.value
                })
              }
            />
          </label>

          <label>
            Nội thất
            <textarea
              value={editing.noi_that || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  noi_that:e.target.value
                })
              }
            />
          </label>

          <label>
            Mô tả
            <textarea
              value={editing.mo_ta || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  mo_ta:e.target.value
                })
              }
            />
          </label>

          <label>
            Số điện thoại
            <input
              value={editing.so_dien_thoai || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  so_dien_thoai:e.target.value
                })
              }
            />
          </label>

          <label>
            Số Zalo
            <input
              value={editing.so_zalo || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  so_zalo:e.target.value
                })
              }
            />
          </label>

          <label>
            Trạng thái

            <select
              value={editing.trang_thai || ""}
              onChange={e=>
                setEditing({
                  ...editing,
                  trang_thai:e.target.value
                })
              }
            >
              <option value="trong">
                Đang trống
              </option>

              <option value="sap_trong">
                Sắp trống
              </option>

              <option value="da_thue">
                Đã thuê
              </option>

              <option value="ngung">
                Ngừng cho thuê
              </option>
            </select>
          </label>

          <div className="actions">

            <button
              onClick={saveRoom}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
            </button>

            <button
              onClick={()=>setEditing(null)}
              disabled={saving}
            >
              Hủy
            </button>

          </div>

        </div>
      )}

    </main>
  );
}

/* =========================
   ADMIN PANEL
========================= */

function AdminPanel({user}){

  const [rooms,setRooms] = useState([]);
  const [msg,setMsg] = useState("");


  const load = async()=>{

    const {data,error} =
      await supabase
        .from("rooms")
        .select("*")
        .order("code");


    if(error){

      setMsg(error.message);

    }else{

      setRooms(data || []);

    }

  };


  useEffect(()=>{

    load();

  },[]);


  const update = async(id,value)=>{

    setMsg("");


    const {error} =
      await supabase
        .from("rooms")
        .update({
          trang_thai:value
        })
        .eq("id",id);


    if(error){

      setMsg(error.message);

    }else{

      load();

    }

  };


  const logout = async()=>{

    await supabase.auth.signOut();

    window.location.href="/admin";

  };


  return (

    <main className="wrap adminpage">

      <div className="admin-head">

        <div>

          <h1>
            Quản lý phòng
          </h1>

          <p>
            Đang đăng nhập: {user.email}
          </p>

        </div>


        <button onClick={logout}>
          Đăng xuất
        </button>

      </div>


      {msg && (

        <div className="error">
          {msg}
        </div>

      )}


      <div className="table">

        {rooms.map(r=>(

          <div
            className="tr"
            key={r.id}
          >

            <div>

              <b>
                {r.code}
              </b>

              <small>
                {r.dia_chi || r.khu_vuc || ""}
              </small>

            </div>


            <select
              value={r.trang_thai || ""}
              onChange={e =>
                update(
                  r.id,
                  e.target.value
                )
              }
            >

              <option value="trong">
                Đang trống
              </option>

              <option value="sap_trong">
                Sắp trống
              </option>

              <option value="da_thue">
                Đã thuê
              </option>

              <option value="ngung">
                Ngừng
              </option>

            </select>

          </div>

        ))}

      </div>

    </main>

  );

}


ReactDOM
  .createRoot(
    document.getElementById("root")
  )
  .render(<App/>);
