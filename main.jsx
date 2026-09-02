import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  Navigate
} from "react-router-dom";

import {
  Home,
  Search,
  MapPin,
  Phone,
  MessageCircle,
  RefreshCw,
  ChevronLeft,
  LogOut,
  Pencil,
  Save
} from "lucide-react";

import { supabase } from "./supabase";
import "./styles.css";


/* =========================
   NHÃN TRẠNG THÁI
========================= */

const labels = {
  trong: "Đang trống",
  sap_trong: "Sắp trống",
  da_thue: "Đã thuê",
  ngung: "Ngừng cho thuê"
};


/* =========================
   ĐỊNH DẠNG TIỀN
========================= */

const money = (v) =>
  v == null
    ? "Liên hệ"
    : new Intl.NumberFormat("vi-VN").format(v) + " đ/tháng";


/* =========================
   APP
========================= */

function App() {
  return (
    <BrowserRouter>

      <header>
        <div className="nav wrap">

          <Link to="/" className="brand">

            <span className="logo">
              <Home size={21} />
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
          element={<Rooms />}
        />

        <Route
          path="/phong/:code"
          element={<Detail />}
        />

        <Route
          path="/admin"
          element={<Admin />}
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

function Rooms() {

  const [rooms, setRooms] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");


  const load = async () => {

    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("code");


    if (error) {

      setErr(error.message);

    } else {

      setRooms(data || []);

    }

    setLoading(false);
  };


  useEffect(() => {
    load();
  }, []);


  const list = rooms.filter((r) =>
    `${r.code || ""} ${r.khu_vuc || ""} ${r.dia_chi || ""} ${r.loai_hinh || ""}`
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
            <br />
            <em>để an cư, để lập nghiệp.</em>
          </h1>

          <p>
            Thông tin phòng được quản lý tập trung
            và cập nhật theo từng căn.
          </p>


          <div className="search">

            <Search size={20} />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
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
            <RefreshCw size={17} />
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

            <br />

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

            {list.map((r) => (
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

function Card({ r }) {

  return (

    <Link
      className="card"
      to={"/phong/" + encodeURIComponent(r.code)}
    >

      <div className="photo">

        <Home size={38} />

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
            className={"badge " + r.trang_thai}
          >
            {labels[r.trang_thai] || r.trang_thai}
          </span>

        </div>


        <h3>
          {r.loai_hinh || "Phòng trọ"}
        </h3>


        <div className="muted">

          <MapPin size={15} />

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

function Detail() {

  const { code } = useParams();

  const [r, setR] = useState(null);
  const [err, setErr] = useState("");


  useEffect(() => {

    const load = async () => {

      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .maybeSingle();


      if (error) {
        setErr(error.message);
      } else {
        setR(data);
      }

    };

    load();

  }, [code]);


  if (err) {

    return (
      <div className="wrap state">
        {err}
      </div>
    );

  }


  if (!r) {

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
        <ChevronLeft size={18} />
        Danh sách phòng
      </Link>


      <div className="detailbox">

        <div className="bigphoto">

          <Home size={70} />

          <b>
            {r.code}
          </b>

        </div>


        <div>

          <span
            className={"badge " + r.trang_thai}
          >
            {labels[r.trang_thai] || r.trang_thai}
          </span>


          <h1>
            {r.loai_hinh || "Phòng trọ"}
          </h1>


          <div className="muted">

            <MapPin size={18} />

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
                  {new Intl.NumberFormat("vi-VN")
                    .format(r.tien_coc)}{" "}
                  đ
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
                href={"tel:" + r.so_dien_thoai}
              >
                <Phone size={18} />
                Gọi ngay
              </a>

            )}


            {r.so_zalo && (

              <a
                href={"https://zalo.me/" + r.so_zalo}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} />
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
   ADMIN
========================= */

function Admin() {

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);


  useEffect(() => {

    let mounted = true;


    const checkUser = async () => {

      const {
        data: { user }
      } = await supabase.auth.getUser();


      if (mounted) {

        setUser(user);
        setChecking(false);

      }

    };


    checkUser();


    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        setUser(session?.user || null);
        setChecking(false);

      }
    );


    return () => {

      mounted = false;

      subscription.unsubscribe();

    };

  }, []);


  if (checking) {

    return (
      <main className="wrap adminpage">
        <div className="state">
          Đang kiểm tra đăng nhập…
        </div>
      </main>
    );

  }


  if (!user) {
    return <AdminLogin />;
  }


  return (
    <AdminManager
      user={user}
    />
  );
}


/* =========================
   ĐĂNG NHẬP
========================= */

function AdminLogin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const login = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");


    const { error } =
      await supabase.auth.signInWithPassword({

        email: email.trim(),
        password

      });


    if (error) {

      setError(
        "Email hoặc mật khẩu không đúng."
      );

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
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />


        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
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
   QUẢN LÝ PHÒNG
========================= */

function AdminManager({ user }) {

  const [rooms, setRooms] = useState([]);

  const [editing, setEditing] = useState(null);

  const [msg, setMsg] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);


  /* =========================
     TẢI PHÒNG
  ========================= */

  const load = async () => {

    setLoading(true);

    setError("");

    const { data, error } =
      await supabase
        .from("rooms")
        .select("*")
        .order("code");


    if (error) {

      setError(error.message);

    } else {

      setRooms(data || []);

    }

    setLoading(false);
  };


  useEffect(() => {
    load();
  }, []);


  /* =========================
     BẤM SỬA
  ========================= */

  const editRoom = (room) => {

    setEditing({
      ...room
    });

    setMsg("");
    setError("");
  };


  /* =========================
     THAY ĐỔI FIELD
  ========================= */

  const changeField = (field, value) => {

    setEditing((old) => ({
      ...old,
      [field]: value
    }));

  };


  /* =========================
     LƯU SUPABASE
  ========================= */

  const saveRoom = async () => {

    if (!editing) return;


    setSaving(true);
    setMsg("");
    setError("");


    const updateData = {

      code: editing.code || null,

      khu_vuc:
        editing.khu_vuc || null,

      dia_chi:
        editing.dia_chi || null,

      loai_hinh:
        editing.loai_hinh || null,

      gia_thue:
        editing.gia_thue !== "" &&
        editing.gia_thue != null
          ? Number(editing.gia_thue)
          : null,

      tien_coc:
        editing.tien_coc !== "" &&
        editing.tien_coc != null
          ? Number(editing.tien_coc)
          : null,

      dien_tich:
        editing.dien_tich !== "" &&
        editing.dien_tich != null
          ? Number(editing.dien_tich)
          : null,

      tang:
        editing.tang !== "" &&
        editing.tang != null
          ? Number(editing.tang)
          : null,

      mo_ta:
        editing.mo_ta || null,

      noi_that:
        editing.noi_that || null,

      so_dien_thoai:
        editing.so_dien_thoai || null,

      so_zalo:
        editing.so_zalo || null,

      trang_thai:
        editing.trang_thai || "trong"
    };


    const { data, error } =
      await supabase
        .from("rooms")
        .update(updateData)
        .eq("id", editing.id)
        .select()
        .single();


    setSaving(false);


    if (error) {

      console.error(error);

      setError(
        "Không lưu được: " + error.message
      );

      return;
    }


    console.log("Đã lưu:", data);


    setMsg(
      "✅ Đã lưu thông tin phòng " +
      editing.code
    );


    setEditing(null);


    await load();

  };


  /* =========================
     ĐĂNG XUẤT
  ========================= */

  const logout = async () => {

    await supabase.auth.signOut();

  };


  /* =========================
     GIAO DIỆN
  ========================= */

  return (

    <main className="wrap adminpage">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          marginBottom: "20px"
        }}
      >

        <div>

          <h1>
            Quản lý phòng
          </h1>

          <p>
            Đang đăng nhập:{" "}
            <b>
              {user.email}
            </b>
          </p>

        </div>


        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 12px"
          }}
        >

          <LogOut size={17} />

          Đăng xuất

        </button>

      </div>


      {msg && (

        <div
          style={{
            background: "#e5f6e9",
            color: "#147332",
            border: "1px solid #c9e8cf",
            padding: "14px",
            borderRadius: "10px",
            marginBottom: "15px"
          }}
        >
          {msg}
        </div>

      )}


      {error && (

        <div className="error">
          {error}
        </div>

      )}


      {loading && (

        <div className="state">
          Đang tải danh sách phòng…
        </div>

      )}


      {!loading && !editing && (

        <div className="table">

          {rooms.length === 0 ? (

            <div className="state">
              Chưa có phòng.
            </div>

          ) : (

            rooms.map((r) => (

              <div
                className="tr"
                key={r.id}
              >

                <div>

                  <b>
                    {r.code}
                  </b>

                  <small>
                    {r.dia_chi ||
                      r.khu_vuc ||
                      "Chưa có địa chỉ"}
                  </small>

                </div>


                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >

                  <span
                    className={
                      "badge " +
                      r.trang_thai
                    }
                  >
                    {labels[r.trang_thai] ||
                      r.trang_thai}
                  </span>


                  <button
                    onClick={() =>
                      editRoom(r)
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >

                    <Pencil size={15} />

                    Sửa

                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      )}


      {/* =========================
          FORM SỬA
      ========================= */}

      {editing && (

        <div
          className="editbox"
          style={{
            background: "#fff",
            border: "1px solid #e1e6e1",
            borderRadius: "16px",
            padding: "22px"
          }}
        >

          <h2>
            Sửa phòng {editing.code}
          </h2>


          <label>
            Mã phòng

            <input
              value={editing.code || ""}
              onChange={(e) =>
                changeField(
                  "code",
                  e.target.value
                )
              }
            />

          </label>


          <label>
            Khu vực

            <input
              value={editing.khu_vuc || ""}
              onChange={(e) =>
                changeField(
                  "khu_vuc",
                  e.target.value
                )
              }
            />

          </label>


          <label>
            Địa chỉ

            <input
              value={editing.dia_chi || ""}
              onChange={(e) =>
                changeField(
                  "dia_chi",
                  e.target.value
                )
              }
            />

          </label>


          <label>
            Loại hình

            <input
              value={editing.loai_hinh || ""}
              onChange={(e) =>
                changeField(
                  "loai_hinh",
                  e.target.value
                )
              }
            />

          </label>


          <label>
            Giá thuê

            <input
              type="number"
              value={editing.gia_thue ?? ""}
              onChange={(e) =>
                changeField(
                  "gia_thue",
                  e.target.value
                )
              }
            />

          </label>


          <label>
            Tiền cọc

            <input
              type="number"
              value={editing.tien_coc ?? ""}
              onChange={(e) =>
                changeField(
                  "tien_coc",
                  e.target.value
                )
              }
            />

          </label>


          <label>
            Diện tích (m²)

            <input
              type="number"
              value={editing.dien_tich ?? ""}
              onChange={(e) =>
                changeField(
                  "dien_tich",
                  e.target.value
                )
              }
            />

          </label>


          <label>
            Tầng

            <input
              type="number"
              value={editing.tang ?? ""}
              onChange={(e) =>
                changeField(
                  "tang",
                  e.target.value
                )
              }
            />

          </label>


          <label>
            Nội thất

            <textarea
              value={editing.noi_that || ""}
              onChange={(e) =>
                changeField(
                  "noi_that",
                  e.target.value
                )
              }
            />

          </label>


          <label>
            Mô tả

            <textarea
              value={editing.mo_ta || ""}
              onChange={(e) =>
                changeField(
                  "mo_ta",
                  e.target.value
                )
              }
            />

          </label>


          <label>
            Số điện thoại

            <input
              value={
                editing.so_dien_thoai || ""
              }
              onChange={(e) =>
                changeField(
                  "so_dien_thoai",
                  e.target.value
                )
              }
            />

          </label>


          <label>
            Số Zalo

            <input
              value={editing.so_zalo || ""}
              onChange={(e) =>
                changeField(
                  "so_zalo",
                  e.target.value
                )
              }
            />

          </label>


          <label>
            Trạng thái

            <select
              value={
                editing.trang_thai || "trong"
              }
              onChange={(e) =>
                changeField(
                  "trang_thai",
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
                Ngừng cho thuê
              </option>

            </select>

          </label>


          <div
            className="actions"
            style={{
              marginTop: "22px"
            }}
          >

            <button
              onClick={saveRoom}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                background: "#166534",
                color: "#fff",
                padding: "12px 16px",
                border: 0,
                borderRadius: "10px",
                fontWeight: "bold"
              }}
            >

              <Save size={18} />

              {saving
                ? "Đang lưu..."
                : "Lưu thay đổi"}

            </button>


            <button
              onClick={() =>
                setEditing(null)
              }
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
   RENDER
========================= */

ReactDOM
  .createRoot(
    document.getElementById("root")
  )
  .render(<App />);
