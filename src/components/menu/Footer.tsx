import "../../assets/footer/footer.css";
export default function Footer() {
  return (
    <footer className="bg-white text-dark py-3 mt-4 footerContent">
      <div className="container text-center">
        <span>contact: palestine [at] communistmuseum.org</span>
        <div className="footerBottom">
          <span
            style={{
              direction: "rtl",
              textAlign: "right",
            }}
            className=""
          >
            المتحف الشيوعي الفلسطيني
          </span>

          <span className="footerLeft">THE COMMUNIST MUSEUM OF PALESTINE</span>
        </div>
      </div>
    </footer>
  );
}
