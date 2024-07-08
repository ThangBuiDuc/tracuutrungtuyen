import logo from "../assets/logo.png";
import { Divider } from "@nextui-org/react";
const Index = () => {
  return (
    <div className="bg-[#0083C2] w-full h-[10vh] md:h-[20vh] flex gap-2 justify-center">
      <img src={logo} alt="Logo HPU" className="h-full object-cover " />
      <div className="flex flex-col gap-1 justify-center ">
        <h4 className="uppercase text-white ">
          trường đại học quản lý và công nghệ hải phòng
        </h4>
        <Divider orientation="horizontal" className="hidden md:block" />
        <h5 className="hidden md:block uppercase text-white">
          Hai Phong University of Management and Technology
        </h5>
      </div>
    </div>
  );
};

export default Index;
