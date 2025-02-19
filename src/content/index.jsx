import { RadioGroup, Radio } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import Content from "./content";

const Index = () => {
  const [selected, setSelected] = useState("cccd");
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState(null);
  const [hidden, setHidden] = useState(false);
  // const [result, setResult] = useState(null);

  useEffect(() => {
    setQuery("");
    setCondition(null);
    setHidden(false);
  }, [selected]);
  return (
    <div className="pl-[5vw] pr-[5vw] md:pl-[18vw] md:pr-[18vw] flex flex-col gap-12 mt-10">
      <h5 className="uppercase text-center pt-5">
        kết quả xét tuyển đại học chính quy - Năm 2025
      </h5>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 md:justify-center items-center">
          <p>Tra cứu theo:</p>
          <RadioGroup
            // label="Tra cứu theo:"
            value={selected}
            onValueChange={setSelected}
            orientation="horizontal"
            className="self-center"
          >
            {/* <Radio value="hoten">Họ và tên</Radio> */}
            <Radio value="cccd">Số CCCD/CMT</Radio>
          </RadioGroup>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCondition(query);
            setHidden(true);
          }}
          className="flex gap-1 md:w-[50%] w-full justify-center items-center self-center"
        >
          <Input
            size="sm"
            type="text"
            label={selected === "hoten" ? "Họ và tên" : "Số CCCD/CMT"}
            variant="bordered"
            className="w-[90%] "
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            className="h-12"
            isDisabled={!query}
            color="primary"
            onClick={() => {
              setCondition(query);
              setHidden(true);
            }}
          >
            Tìm kiếm
          </Button>
        </form>
        {condition != null && (
          <Content condition={condition} selected={selected} />
        )}
        {!hidden && (
          <>
            <div className="flex flex-col gap-2 self-center md:w-[50%] w-full">
              <p className="font-semibold text-justify">Chú ý:</p>
              {/* <p className="font-semibold text-justify">
                * Tìm kiếm theo Họ và tên:
              </p>
              <p className="text-justify">
                - Bước 1: Trong mục Tra cứu theo: bạn chọn mục Họ và tên
              </p>
              <p className="text-justify">
                - Bước 2: Gõ đầy đủ Họ và tên cần tìm vào ô tìm kiếm .
              </p>
              <p className="text-justify">- Bước 3: Ấn vào nút Tìm kiếm</p> */}
              <p className="font-semibold text-justify">
                * Tìm kiếm theo CCCD/CMT:
              </p>
              {/* <p className="text-justify  flex">
                <span className="md:block hidden">-&nbsp;</span>Bước 1: Trong
                mục tra cứu theo: bạn chọn mục CCCD/CMT
              </p> */}
              <p className="text-justify flex">
                <span className="md:block hidden">-&nbsp;</span>Bước 1: Điền đầy
                đủ CCCD/CMT cần tìm vào ô tìm kiếm.
              </p>
              <p className="text-justify flex">
                <span className="md:block hidden">-&nbsp;</span>Bước 2: Ấn vào
                nút Tìm kiếm
              </p>
            </div>
            <div className="md:hidden block">
              <div className="flex flex-col gap-2 self-center w-full border-t-1 mt-8 pb-2">
                <p className="text-[14px] pt-5 text-center flex justify-center">
                  Mọi thắc mắc xin liên hệ:
                  <br />
                  Phòng Tuyển sinh - Hợp tác quốc tế
                  <br />
                  Trường Đại học Quản lý và Công nghệ Hải Phòng
                </p>
                <p className="text-[14px] text-center">
                  Điện thoại: 0901 598 698 - 0936 821 821
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex flex-col gap-2 self-center w-full border-t-1">
                <p className="text-[14px] pt-5 text-center">
                  Mọi thắc mắc xin liên hệ: Phòng Tuyển sinh - Hợp tác quốc tế -
                  Trường Đại học Quản lý và Công nghệ Hải Phòng
                </p>
                <p className="text-[14px] text-center">
                  Hotline: 0901 598 698 - 0936 821 821
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
