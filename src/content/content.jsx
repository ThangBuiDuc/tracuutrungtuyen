import { useQuery } from "@tanstack/react-query";
import {
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";

async function callAPi(selected, condition) {
  return await fetch(
    `${import.meta.env.VITE_MEILISEARCH_HOST}/indexes/${
      import.meta.env.VITE_MEILISEARCH_INDEX
    }/search`,
    {
      method: "POST",
      body: JSON.stringify({
        q:
          selected === "hoten"
            ? `"${condition.trim()}"`
            : `"${condition.trim()}"`,
        attributesToSearchOn: [selected === "hoten" ? "ho_ten" : "cccd"],
        limit: 1000,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_MEILISEARCH_KEY}`,
      },
    }
  ).then((res) => res.json());
}

const ViewTable = ({ hits }) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const resize = (e) => {
      setScreenWidth(e.currentTarget.innerWidth);
    };

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const pages = Math.ceil(hits.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return hits.slice(start, end);
  }, [page, hits]);

  if (screenWidth <= 480) {
    return (
      <div className="p-4 border rounded-[14px] shadow-lg">
        {items?.length > 0 ? (
          <div className="grid grid-cols-2 auto-rows-auto gap-1">
            <p>Số CCCD/CMT:</p>
            <p>{items[0].cccd}</p>
            <p>Họ và tên:</p>
            <p>{items[0].ho_ten}</p>
            <p>Ngày sinh:</p>
            <p>{items[0].ngay_sinh}</p>
            <p>Giới tính:</p>
            <p>{items[0].gioi_tinh}</p>
            <p>Mã ngành xét tuyển:</p>
            <p>{items[0].ma_nganh_xet_tuyen}</p>
            <p>Tên ngành trúng tuyển:</p>
            <p>{items[0].ten_nganh_trung_tuyen}</p>
            <p>Kết quả xét tuyển:</p>
            <p className="font-semibold">{items[0].ket_qua_xet_tuyen}</p>
            <p>Kết quả xét học bổng:</p>
            <p className="italic">{items[0].ket_qua_xet_hoc_bong}</p>
          </div>
        ) : (
          <p className="text-center font-semibold">
            Không tìm thấy kết quả tìm kiếm!
          </p>
        )}
      </div>
    );
  }

  return (
    <Table
      isStriped
      isHeaderSticky
      aria-label="Bảng kết quả thông tin tra cứu trúng tuyển"
      // bottomContent={
      //   <div className="flex w-full justify-center">
      //     <Pagination
      //       isCompact
      //       showControls
      //       showShadow
      //       color="primary"
      //       page={page}
      //       total={pages}
      //       onChange={(page) => setPage(page)}
      //     />
      //   </div>
      // }
    >
      <TableHeader>
        {/* <TableColumn>Mã ĐKXT</TableColumn> */}
        {/* <TableColumn>STT</TableColumn> */}
        <TableColumn>Số CCCD/CMT</TableColumn>
        <TableColumn>Họ và tên</TableColumn>
        <TableColumn className="text-center">Ngày sinh</TableColumn>
        <TableColumn className="text-center">Giới tính</TableColumn>
        <TableColumn className="text-center">Mã ngành xét tuyển</TableColumn>
        <TableColumn>Tên ngành trúng tuyển</TableColumn>
        <TableColumn>Kết quả xét tuyển</TableColumn>
        <TableColumn>Kết quả xét học bổng</TableColumn>
      </TableHeader>
      <TableBody emptyContent="Không tìm thấy kết quả tìm kiếm!">
        {items.map((item) => (
          <TableRow key={item.cccd}>
            {/* <TableCell>{item.ma_dkxt}</TableCell> */}
            <TableCell>{item.cccd}</TableCell>
            <TableCell className="whitespace-nowrap">{item.ho_ten}</TableCell>
            <TableCell className="text-center">{item.ngay_sinh}</TableCell>
            <TableCell className="text-center">{item.gioi_tinh}</TableCell>
            <TableCell className="text-center">
              {item.ma_nganh_xet_tuyen}
            </TableCell>
            <TableCell>{item.ten_nganh_trung_tuyen}</TableCell>
            <TableCell className="font-semibold">
              {item.ket_qua_xet_tuyen}
            </TableCell>
            <TableCell className="italic">
              {item.ket_qua_xet_hoc_bong}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const Content = ({ condition, selected }) => {
  //   console.log(condition);
  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["search", condition, selected],
    queryFn: () => callAPi(selected, condition),
  });

  if (isFetching || isLoading) return <Spinner />;

  return (
    <div className="pb-2 gap-3 flex flex-col">
      <ViewTable hits={data.hits} />
      <>
        <div className="flex flex-col gap-2 self-center w-full">
          <p className="text-justify">
            Để chính thức trở thành Tân sinh viên của Trường Đại học Quản lý và
            Công nghệ Hải Phòng, thí sinh cần thực hiện các bước sau:
          </p>
          <p className="text-justify">
            1. Xác nhận nhập học trực tuyến trên hệ thống của Bộ GDĐT vào Trường
            qua link:{" "}
            <a
              href="https://thisinh.thitotnghiepthpt.edu.vn/"
              target="_blank"
              className="text-blue-600 "
            >
              https://thisinh.thitotnghiepthpt.edu.vn/
            </a>{" "}
            <span className="font-semibold">trước 17h00 ngày 27/8/2024</span>.
          </p>
          <p className="text-justify">
            2. Nhập học trực tiếp tại Tầng 1 Nhà A Khu Giảng đường Trường Đại
            học Quản lý và Công nghệ Hải Phòng từ{" "}
            <span className="font-semibold">ngày 21/8/2024.</span>.
          </p>
          <p className="text-justify">
            Chi tiết thông tin về kế hoạch nhập học, xem tại:{" "}
            <a
              href="https://hpu.edu.vn/blogs/thong-bao/ke-hoach-nhap-hoc-dot-1"
              target="_blank"
              className="text-blue-600"
            >
              https://hpu.edu.vn/blogs/thong-bao/ke-hoach-nhap-hoc-dot-1
            </a>
          </p>
          <p>
            <span className="font-semibold">LƯU Ý</span>: Các thí sinh trúng
            tuyển vào Trường đủ điều kiện tham gia XÉT CẤP HỌC BỔNG cần nhập học
            đợt 1 vào Trường từ{" "}
            <span className="font-semibold">21/8 đến 27/8/2024</span>.
          </p>
          {/* <p className="text-justify">
            Thí sinh cần{" "}
            <span className="font-semibold">hoàn thành xác nhận nhập học</span>{" "}
            trên hệ thống của Bộ Giáo dục và Đào tạo{" "}
            <span className="font-semibold">trước 17h00 ngày 27/8/2024</span> và
            thực hiện các thủ tục{" "}
            <span className="font-semibold">nhập học theo hướng dẫn</span> của
            Nhà trường, chi tiết xem tại{" "}
            <a
              href="https://hpu.edu.vn/blogs/thong-bao/ke-hoach-nhap-hoc-dot-1"
              target="_blank"
              className="text-blue-600 underline uppercase"
            >
              link
            </a>
            .
          </p> */}
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
    </div>
  );
};

export default Content;
