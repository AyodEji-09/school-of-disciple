import { useState } from "react";
// import { useDropzone } from "react-dropzone";
// import moment from "moment";
import FroalaEditor from "react-froala-wysiwyg";
import "froala-editor/js/plugins/image.min.js";
import "froala-editor/js/plugins/char_counter.min.js";
import "froala-editor/js/plugins/paragraph_format.min.js";
import "froala-editor/js/plugins/link.min.js";
import "froala-editor/js/plugins/font_size.min.js";
import "froala-editor/js/plugins/line_height.min.js";
import "froala-editor/js/plugins/lists.min.js";
import "froala-editor/js/plugins/save.min.js";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import { AiOutlineEye } from "react-icons/ai";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { Option, Select, Textarea, Typography } from "@mui/joy";

type InputProps = {
  type?: string;
  label?: string;
  options?: [{ _id: string; name: string }];
  selectHolder?: string;
  placeholder?: string;
  name?: string;
  value?: string;
  max?: number;
  onChange?: (e: any) => void;
};

const Input = ({
  type,
  label,
  options,
  selectHolder,
  placeholder,
  name,
  max,
  value,
  onChange,
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShow = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col">
      <label>
        <Typography level="body-sm" textColor={"#15141D"}>
          {label}
        </Typography>
      </label>
      {type === "email" ? (
        <div className="relative w-full flex items-center">
          <input
            type="email"
            className="outline-none outline-0 border rounded-md h-10 border-white bg-[#F3F5F5] px-4 w-full placeholder:text-gray-400 placeholder:text-sm min-w-24"
            placeholder={placeholder}
            name={name}
            value={value}
            onChange={onChange}
          />
          {/* <span className="absolute right-4">
              <Email />
            </span> */}
        </div>
      ) : type === "password" ? (
        <div className="relative w-full flex items-center">
          {/* <span className="absolute left-4 w-10">
            <LockIcon />
          </span> */}
          <input
            type={showPassword ? "text" : "password"}
            className="outline-none outline-0 border rounded-md h-10 border-white bg-[#F3F5F5] px-4 w-full placeholder:text-gray-400 placeholder:text-sm min-w-24"
            placeholder={placeholder}
            name={name}
            value={value}
            onChange={onChange}
          />
          <span
            className="absolute right-4 cursor-pointer"
            onClick={toggleShow}
          >
            {showPassword ? <AiOutlineEye /> : <AiOutlineEye />}
          </span>
        </div>
      ) : type === "textArea" ? (
        <Textarea
          className="outline-none outline-0 border rounded-md !border-white !bg-[#F3F5F5]  p-4 w-full placeholder:text-gray-400 placeholder:text-sm min-w-24"
          // rows={3}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
        />
      ) : type === "select" ? (
        <select
          className="outline-none outline-0 border rounded-md h-10 !border-white !bg-[#F3F5F5] px-4 w-full placeholder:text-gray-400 placeholder:text-sm min-w-24"
          name={name}
          value={value}
          onChange={onChange}
        >
          <option value="" className="t text-gray-400">
            {selectHolder || "select"}
          </option>
          {options?.map((option: { _id: string; name: string }) => (
            <option value={option?._id} className="capitalize">
              {option.name}
            </option>
          ))}
        </select>
      ) : (
        <input
          maxLength={max}
          type={type}
          className="outline-none outline-0 border rounded-md h-10 border-white bg-[#F3F5F5] px-4 w-full placeholder:text-gray-400 placeholder:text-sm min-w-24"
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default Input;

export const Toggle = ({
  label,
  ...restProps
}: {
  label: string;
  restProps: any;
}) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input type="checkbox" value="" className="sr-only peer" {...restProps} />
      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
      <span className="ms-3 text-sm font-medium text-gray-900">{label}</span>
    </label>
  );
};

export const Checkbox = ({ label }: { label: string }) => {
  return (
    <div className="flex items-center mb-4">
      <input
        id="default-checkbox"
        type="checkbox"
        value=""
        className="w-4 h-4 text-[#001EC5] bg-gray-100 border-gray-300 rounded focus:ring-[#001EC5]"
      />
      <label
        htmlFor="default-checkbox"
        className="ms-2 text-sm font-semibold text-gray-900"
      >
        {label}
      </label>
    </div>
  );
};

export const RadioButton = ({
  label,
  checked = false,
}: {
  label: string;
  checked: boolean;
}) => {
  return (
    <div className="flex items-center mb-4">
      <input
        type="radio"
        className="w-4 h-4 text-[#2E700E] bg-gray-100 border-gray-300"
        checked={checked}
      />
      <label className="ms-2 text-sm font-semibold text-gray-900">
        {label}
      </label>
    </div>
  );
};

export const ImageUploader = ({
  acceptedFiles,
  inputProps,
  rootProps,
}: {
  acceptedFiles: any;
  inputProps: any;
  rootProps: any;
}) => {
  // const { acceptedFiles, getRootProps, getInput max={max}Props } = useDropzone();

  const files = acceptedFiles.map((file: { path: string; size: number }) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <div className="w-full p-4 border border-gray-200 rounded-lg cursor-pointer">
      <div
        {...rootProps({
          className: "dropzone",
        })}
      >
        <input {...inputProps()} />
        {acceptedFiles[0] ? (
          <aside className="text-center h-20 leading-[80px]">
            <ul>{files}</ul>
          </aside>
        ) : (
          <div className="flex gap-4flex items-center gap-4">
            <div>
              {/* <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                <ImageIcon />
              </div> */}
            </div>
            <div className="">
              <div className="font-semibold text-sm">
                Drag and drop your image, or browse
              </div>
              <div className="text-xs text-gray-500">
                Maximum file size 4MB, image support (png, jpg) with 16:9 aspect
                ratio
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
