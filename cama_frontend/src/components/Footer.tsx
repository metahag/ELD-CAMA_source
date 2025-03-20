
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-300 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-screen-xl">
        <div className="grid grid-cols-2 gap-8 px-4 py-6 lg:py-8 md:grid-cols-3">
          <div>
            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
              Company
            </h2>
            <ul className="text-gray-500 dark:text-gray-400 font-medium">
              <li className="mb-4">
                <Link to="About" className=" hover:underline">
                  About
                </Link>
              </li>
              <li className="mb-4">
                <Link to="FbF" className=" hover:underline">
                  Faktabaserad Fakta
                </Link>
              </li>
              <li className="mb-4">
                <Link to="Team" className=" hover:underline">
                  Team
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
              Help center
            </h2>
            <ul className="text-gray-500 dark:text-gray-400 font-medium">
              <li className="mb-4">
                <a href="#" className="hover:underline">
                  Documentation
                </a>
              </li>
              <li className="mb-4">
                <a href="#" className="hover:underline">
                  Data
                </a>
              </li>
              <li className="mb-4">
                <a href="#" className="hover:underline">
                  Metadata
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
              Contact
            </h2>
            <ul className="text-gray-500 dark:text-gray-400 font-medium">
              <li className="mb-4">
                <Link to="ContactInfo" className=" hover:underline">
                  Contact info
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
