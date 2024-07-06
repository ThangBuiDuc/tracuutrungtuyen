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
        q: selected === "hoten" ? condition.trim() : `"${condition.trim()}"`,
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
        <TableColumn>STT</TableColumn>
        <TableColumn>Số CCCD/CMT</TableColumn>
        <TableColumn>Họ tên</TableColumn>
        <TableColumn>Ngày sinh</TableColumn>
        <TableColumn>Giới tính</TableColumn>
        <TableColumn>Mã ngành trúng tuyển</TableColumn>
        <TableColumn>Tên ngành trúng tuyển</TableColumn>
      </TableHeader>
      <TableBody emptyContent="Không tìm thấy kết quả tìm kiếm!">
        {items.map((item, index) => (
          <TableRow key={item.cccd}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{item.cccd}</TableCell>
            <TableCell>{item.ho_ten}</TableCell>
            <TableCell>{item.ngay_sinh}</TableCell>
            <TableCell>{item.gioi_tinh}</TableCell>
            <TableCell>{item.nganh_trung_tuyen}</TableCell>
            <TableCell>{item.ten_nganh_trung_tuyen}</TableCell>
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
        <div className="flex flex-col gap-2 self-center md:w-[50%] w-full">
          <p className="font-semibold">Ghi chú:</p>
          <p className="font-semibold">
            (1) Đối với thí sinh đủ điều kiện trúng tuyển:
          </p>
          <p>
            - Để chính thức trở thành tân sinh viên của Trường DH QL & CN HP,
            thí sinh cần đăng ký nguyện vọng đã đủ điều kiện trúng tuyển trên hệ
            thống xét tuyển của Bộ GDDT ở mức độ ưu tiên cao nhất (Nguyện vọng
            1)
          </p>
          <p className="font-semibold">
            (2) Đối với thí sinh thiếu thông tin hoặc không đủ điều kiện trúng
            tuyển:
          </p>
          <p>- Thí sinh liên hệ hotline để được tư vấn và hướng dẫn</p>
        </div>
        <div className="flex flex-col gap-2 self-center w-full border-t-1">
          <p className="text-center text-[14px] pt-5">
            Mọi thắc mắc xin liên hệ: Phòng Tuyển sinh - Hợp tác quốc tế -
            Trường Đại học Quản lý & Công nghệ Hải Phòng
          </p>
          <p className="text-center text-[14px]">
            Điện thoại: 0901 598 698 - 0936 821 821
          </p>
        </div>
      </>
    </div>
  );
};

export default Content;
