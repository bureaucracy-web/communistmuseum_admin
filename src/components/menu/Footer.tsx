import "../../assets/footer/footer.css";
export default function Footer() {
  return (
    <footer className="bg-white text-dark py-3 mt-4 footerContent">
      <div className="container text-center">
        <p>Contact us: info@example.com | +374 99 123456</p>
        <p className="">
          &copy; {new Date().getFullYear()} My Website. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
