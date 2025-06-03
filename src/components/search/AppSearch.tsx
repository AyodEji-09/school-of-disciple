import React from "react";

const AppSearch = ({
  searchVar,
  setSearchVar,
}: {
  searchVar?: string;
  setSearchVar?: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="max-w-fit text-[#001F54] flex items-center">
      <label
        htmlFor="default-search"
        className="md:mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
      >
        Search
      </label>
      <div className="relative h-fit">
        <div className="static md:absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          id="default-search"
          onChange={(e) => {
            e.preventDefault();
            setSearchVar(e.target.value);
          }}
          value={searchVar}
          className="sm:block w-full px-4 h-10 ps-10 text-sm text-gray-900 border border-gray-300 rounded-full hidden placeholder:text-[#001F54]"
          placeholder="Search"
          required
        />
      </div>
    </div>
  );
};

export default AppSearch;
