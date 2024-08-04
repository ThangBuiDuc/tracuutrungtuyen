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
import { useMemo, useState } from "react";

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
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const pages = Math.ceil(hits.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return hits.slice(start, end);
  }, [page, hits]);

  return (
    <Table
      isStriped
      isHeaderSticky
      aria-label="Bảng kết quả thông tin tra cứu trúng tuyển"
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
        </div>
      }
    >
      <TableHeader>
        <TableColumn>Mã ĐKXT</TableColumn>
        {/* <TableColumn>STT</TableColumn> */}
        <TableColumn>Số CCCD/CMT</TableColumn>
        <TableColumn>Họ và tên</TableColumn>
        <TableColumn className="text-center">Giới tính</TableColumn>
        <TableColumn className="text-center">Ngày sinh</TableColumn>
        <TableColumn className="text-center">Mã ngành xét tuyển</TableColumn>
        <TableColumn>Tên ngành xét tuyển</TableColumn>
        <TableColumn>Kết quả xét tuyển</TableColumn>
        <TableColumn>Kết quả xét học bổng</TableColumn>
      </TableHeader>
      <TableBody emptyContent="Không tìm thấy kết quả tìm kiếm!">
        {items.map((item) => (
          <TableRow key={item.cccd}>
            <TableCell>{item.ma_dkxt}</TableCell>
            <TableCell>{item.cccd}</TableCell>
            <TableCell className="whitespace-nowrap">{item.ho_ten}</TableCell>
            <TableCell className="text-center">{item.gioi_tinh}</TableCell>
            <TableCell className="text-center">{item.ngay_sinh}</TableCell>
            <TableCell className="text-center">
              {item.nganh_trung_tuyen}
            </TableCell>
            <TableCell>{item.ten_nganh_trung_tuyen}</TableCell>
            <TableCell>Đủ điều kiện trúng tuyển</TableCell>
            <TableCell>Đủ điều kiện</TableCell>
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
          <p className="font-semibold text-justify">Ghi chú:</p>
          <p className="font-semibold text-justify">
            Thí sinh cần hoàn thành xác nhận nhập học trên hệ thống của Bộ Giáo
            dục và Đào tạo trước 17h00 ngày 27/8/2024 và thực hiện các thủ tục
            nhập học theo hướng dẫn của Nhà trường, chi tiết xem tại link.
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
    </div>
  );
};

export default Content;
