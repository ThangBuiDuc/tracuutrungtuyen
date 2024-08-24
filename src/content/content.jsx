import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  // Pagination,
} from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { toast } from "sonner";

// async function callAPi(selected, condition) {
//   return await fetch(
//     `${import.meta.env.VITE_MEILISEARCH_HOST}/indexes/${
//       import.meta.env.VITE_MEILISEARCH_INDEX
//     }/search`,
//     {
//       method: "POST",
//       body: JSON.stringify({
//         q:
//           selected === "hoten"
//             ? `"${condition.trim()}"`
//             : `"${condition.trim()}"`,
//         attributesToSearchOn: [selected === "hoten" ? "ho_ten" : "cccd"],
//         limit: 1000,
//       }),
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${import.meta.env.VITE_MEILISEARCH_KEY}`,
//       },
//     }
//   ).then((res) => res.json());
// }

// This function keeps the casing unchanged for str, then perform the conversion
function toNonAccentVietnamese(str) {
  str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/Đ/g, "D");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
  return str;
}

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

async function createQR(invoice, token) {
  const res = await fetch(import.meta.env.VITE_HASURA_CREATE_QR, {
    method: "POST",
    body: JSON.stringify({ invoice, token }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error();

  return res.json();
}

async function apiJWT(cccd) {
  return await fetch(`/api/jwt`, {
    method: "POST",
    body: JSON.stringify({ cccd }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => res.token);
}

async function apiTrungTuyen(condition) {
  return await fetch(
    `${import.meta.env.VITE_HASURA_SV_TRUNG_TUYEN}/${condition}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());
}

async function apiKhoanPhaiThu(condition) {
  return await fetch(
    `${import.meta.env.VITE_HASURA_SV_CAC_KHOAN_PHAI_THU}/${condition}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());
}

const ViewTable = ({ hits }) => {
  const queryClient = useQueryClient();
  const [invoice, setInvoice] = useState(null);
  const [mutating, setMutating] = useState(false);
  const modal1 = useDisclosure();
  const modal2 = useDisclosure();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState();

  useEffect(() => {
    const socket = new WebSocket("ws://api.hpu.edu.vn");

    socket.addEventListener("open", () => {
      console.log("WebSocket connection established");
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      // Update the state with the new message
      setMessages(data);
    });

    socket.addEventListener("close", () => {
      console.log("WebSocket connection closed");
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (messages) {
      if (messages.uuid === invoice?.invoice_uuid) {
        if (messages.edu_status_id === 2) {
          // client.invalidateQueries(["unsubmited"]);
          modal2.onClose();
          queryClient.invalidateQueries(["search", hits[0].CCCD.trim()]);
          toast.success("Thanh toán thành công!", {
            duration: Infinity,
            important: true,
          });
          setInvoice(null);
        }

        // if (messages.status_id === 2 && messages.edu_status_id !== 2) {
        //   client.invalidateQueries(["unsubmited"]);
        //   onClose();
        //   toast.error(
        //     "Thanh toán thành công nhưng hệ thống đã gặp lỗi trong quá trình gạch nợ!",
        //     {
        //       duration: Infinity,
        //       important: true,
        //     }
        //   );
        //   setInvoice(null);
        // }
      }
    }
  }, [messages]);

  const {
    data: revenue,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["revenue", hits[0].SoBaoDanh],
    queryFn: () => apiKhoanPhaiThu(hits[0].SoBaoDanh.trim()),
    enabled: !!hits[0]?.SoBaoDanh,
  });

  const mutation = useMutation({
    mutationFn: async () =>
      await createQR(
        {
          type: 1,
          email,
          cccd: hits[0]?.CCCD,
          name: `${hits[0]?.HoDem.trim()} ${hits[0]?.Ten.trim()}`,
          hoc_ky: 1,
          nam_hoc: hits[0]?.NamTuyenSinh,
          transactionAmount: revenue?.result?.reduce(
            (c, t) => (c = c + t.soTien),
            0
          ),
          transactionDescription: `${hits[0]?.CCCD} ${toNonAccentVietnamese(
            `${hits[0]?.HoDem.trim()} ${hits[0]?.Ten.trim()}`
          )}`,
          EduTransactionDescription: revenue?.result
            ?.map(
              (item) =>
                `${item.TenKhoanThu.trim()}: ${numberWithCommas(item.soTien)}`
            )
            .join("; "),
          detail: revenue?.result?.map((item) => ({
            revenue_code: item.maKhoanThu.trim(),
            amount: item.soTien,
          })),
        },
        await apiJWT(hits[0]?.CCCD)
      ),
    onSuccess: (res) => {
      // console.log(res);
      setMutating(false);
      setInvoice(res);
      modal2.onOpen();
    },
    onError: (err) => {
      console.log(err);
      setMutating(false);
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại!", {
        duration: Infinity,
        important: true,
      });
    },
  });

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

  // if (screenWidth <= 480) {
  //   return (
  //     <div className="p-4 border rounded-[14px] shadow-lg">
  //       {items?.length > 0 ? (
  //         <div className="grid grid-cols-2 auto-rows-auto gap-1">
  //           <p>Số CCCD/CMT:</p>
  //           <p>{items[0].CCCD.trim()}</p>
  //           <p>Họ và tên:</p>
  //           <p>
  //             {items[0].HoDem.trim()} {items[0].Ten.trim()}
  //           </p>
  //           <p>Ngày sinh:</p>
  //           <p>
  //             {items[0].NgaySinh.split("T")[0].split("-").reverse().join("/")}
  //           </p>
  //           <p>Giới tính:</p>
  //           <p>{items[0].GioiTinh ? "Nam" : "Nữ"}</p>
  //           <p>Mã ngành xét tuyển:</p>
  //           <p>{items[0].SoBaoDanh.trim().split(".")[1]}</p>
  //           <p>Tên ngành trúng tuyển:</p>
  //           <p>{items[0].Nganh.TenNganh.trim()}</p>
  //           <p>Kết quả xét tuyển:</p>
  //           <p className="font-semibold">Trúng tuyển</p>
  //           {/* <p>Kết quả xét học bổng:</p>
  //           <p className="italic">{items[0].ket_qua_xet_hoc_bong}</p> */}
  //           <div className="col-span-2 flex justify-center mt-2">
  //             <Button
  //               className="self-center"
  //               color="primary"
  //               onClick={() => {
  //                 modal1.onOpen();
  //               }}
  //             >
  //               Nhập học trực tuyến
  //             </Button>
  //           </div>
  //         </div>
  //       ) : (
  //         <p className="text-center font-semibold">
  //           Không tìm thấy kết quả tìm kiếm!
  //         </p>
  //       )}
  //     </div>
  //   );
  // }

  return (
    <>
      {screenWidth <= 480 ? (
        <div className="p-4 border rounded-[14px] shadow-lg">
          {items?.length > 0 ? (
            <div className="grid grid-cols-2 auto-rows-auto gap-1">
              <p>Số CCCD/CMT:</p>
              <p>{items[0].CCCD.trim()}</p>
              <p>Họ và tên:</p>
              <p>
                {items[0].HoDem.trim()} {items[0].Ten.trim()}
              </p>
              <p>Ngày sinh:</p>
              <p>
                {items[0].NgaySinh.split("T")[0].split("-").reverse().join("/")}
              </p>
              <p>Giới tính:</p>
              <p>{items[0].GioiTinh ? "Nam" : "Nữ"}</p>
              <p>Mã ngành xét tuyển:</p>
              <p>{items[0].SoBaoDanh.trim().split(".")[1]}</p>
              <p>Tên ngành trúng tuyển:</p>
              <p>{items[0].Nganh.TenNganh.trim()}</p>
              <p>Kết quả xét tuyển:</p>
              <p className="font-semibold">Trúng tuyển</p>
              {/* <p>Kết quả xét học bổng:</p>
            <p className="italic">{items[0].ket_qua_xet_hoc_bong}</p> */}
              <div className="col-span-2 flex justify-center mt-2">
                <Button
                  className="self-center"
                  color="primary"
                  onClick={() => {
                    modal1.onOpen();
                  }}
                >
                  Nhập học trực tuyến
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center font-semibold">
              Không tìm thấy kết quả tìm kiếm!
            </p>
          )}
        </div>
      ) : (
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
            <TableColumn className="text-center">
              Mã ngành xét tuyển
            </TableColumn>
            <TableColumn>Tên ngành trúng tuyển</TableColumn>
            <TableColumn>Kết quả xét tuyển</TableColumn>
            <TableColumn>Nhập học trực tuyến</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Không tìm thấy kết quả tìm kiếm!">
            {items.map((item) => (
              <TableRow key={item.CCCD}>
                {/* <TableCell>{item.ma_dkxt}</TableCell> */}
                <TableCell>{item.CCCD}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {item.HoDem.trim()} {item.Ten.trim()}
                </TableCell>
                <TableCell className="text-center">
                  {item.NgaySinh.split("T")[0].split("-").reverse().join("/")}
                </TableCell>
                <TableCell className="text-center">
                  {item.GioiTinh ? "Nam" : "Nữ"}
                </TableCell>
                <TableCell className="text-center">
                  {item.SoBaoDanh.trim().split(".")[1]}
                </TableCell>
                <TableCell>{item.Nganh.TenNganh.trim()}</TableCell>
                <TableCell className="font-semibold">Trúng tuyển</TableCell>
                <TableCell className="italic">
                  <Button
                    color="primary"
                    onClick={() => {
                      modal1.onOpen();
                    }}
                  >
                    Thực hiện
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Modal size={"xl"} isOpen={modal1.isOpen} onClose={modal1.onClose}>
        <ModalContent>
          {() => (
            <>
              {hits[0]?.MaSinhVien ? (
                <ModalContent>
                  {() => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Sinh viên đã nhập học thành công
                      </ModalHeader>
                      <ModalBody>
                        <p>
                          Phiếu thu nhập học đã được gủi về Email của sinh viên
                          đã cung cấp trước đó!
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="primary"
                          variant="light"
                          onPress={modal1.onClose}
                        >
                          Đóng
                        </Button>
                        {/* <Button color="primary" onPress={onClose}>
                  Action
                </Button> */}
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              ) : (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Những khoản phải thu khi nhập học trực tuyến
                  </ModalHeader>
                  <ModalBody>
                    <Table
                      isStriped
                      isHeaderSticky
                      aria-label="Bảng các khoản phải thu khi nhập học trực tuyến"
                    >
                      <TableHeader>
                        <TableColumn>Tên khoản thu</TableColumn>
                        <TableColumn>Số tiền</TableColumn>
                      </TableHeader>
                      <TableBody emptyContent="Không tìm thấy kết quả tìm kiếm!">
                        {revenue?.result?.map((item) => (
                          <TableRow key={item.maKhoanThu}>
                            <TableCell>{item.TenKhoanThu.trim()}</TableCell>
                            <TableCell>
                              {numberWithCommas(item.soTien)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <p>
                      Tổng cộng số tiền cần phải đóng:{" "}
                      <span className="font-bold">
                        {numberWithCommas(
                          revenue?.result?.reduce(
                            (c, t) => (c = c + t.soTien),
                            0
                          )
                        )}
                      </span>
                    </p>
                    <Input
                      isDisabled={revenue?.result.length === 0}
                      errorMessage="Vui lòng nhập đúng định dạng Email!"
                      isInvalid={email && !validateEmail(email)}
                      isRequired
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      isClearable
                      type="email"
                      label="Email"
                      variant="bordered"
                      placeholder="Nhập Email của bạn"
                      defaultValue="junior@nextui.org"
                      onClear={() => setEmail("")}
                      className="max-w-xs"
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      isDisabled={mutating}
                      color="danger"
                      variant="light"
                      onPress={modal1.onClose}
                    >
                      Huỷ
                    </Button>
                    {revenue?.result.length === 0 ? (
                      <></>
                    ) : mutating ? (
                      <Spinner color="primary" />
                    ) : (
                      <Button
                        isDisabled={
                          !email ||
                          (isFetching && isLoading) ||
                          !validateEmail(email)
                        }
                        color="primary"
                        onClick={() => {
                          // console.log(1);
                          // console.log(await apiJWT(hits[0].CCCD));
                          // modal2.onOpen();
                          setMutating(true);
                          mutation.mutate();
                        }}
                      >
                        Thanh toán
                      </Button>
                    )}
                  </ModalFooter>
                </>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal size={"xl"} isOpen={modal2.isOpen} onClose={modal2.onClose}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Thực hiện thanh toán sử dụng mã QR
              </ModalHeader>
              <ModalBody>
                <img src={`data:image/jpeg;base64,${invoice?.qrCode}`} />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  variant="light"
                  onPress={modal2.onClose}
                >
                  Đóng
                </Button>
                {/* <Button color="primary" onPress={onClose}>
                  Action
                </Button> */}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

const Content = ({ condition }) => {
  //   console.log(condition);
  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["search", condition],
    queryFn: () => apiTrungTuyen(condition),
  });

  if (isFetching && isLoading) return <Spinner />;

  // console.log(data);
  return (
    <div className="pb-2 gap-3 flex flex-col">
      <ViewTable hits={data?.result} />
      <>
        <div className="flex flex-col gap-2 self-center w-full">
          <p className="text-justify">
            Ghi chú: Trong Trường hợp không tra thấy kết quả tìm kiếm, Thí sinh
            vui lòng liên hệ Hotline/Zalo Tuyển sinh: 0901 598 698 - 0936 821
            821 để được hướng dẫn chi tiết.
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
