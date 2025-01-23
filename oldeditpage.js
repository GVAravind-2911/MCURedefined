// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import DOMPurify from "isomorphic-dompurify";
// import Layout from "@/components/Layout";
// import Popup from "@/components/Popup";

// export default function page({ blog }){
//     const router = useRouter();
//     const { id } = router.query;
//     const [openModal, setOpenModal] = useState(false);

//     const handleOpenModal = () => setOpenModal(true);
//     const handleCloseModal = () => setOpenModal(false);

//     return (
//         <>
//         <Layout>
//             <div className="create-blog">
//                 <h3 className="title-blog">Enter Title:</h3>
//                 <input
//                 type="text"
//                 id="title"
//                 name="title"
//                 defaultValue={blog.title}
//                 />
//                 <h3 className="author-blog">Author</h3>
//                 <input
//                 type="text"
//                 id="author"
//                 name="author"
//                 defaultValue={blog.author}
//                 />
//                 <h3 className="description-blog">Enter Description:</h3>
//                 <input
//                 type="text"
//                 id="description"
//                 name="description"
//                 defaultValue={blog.description}
//                 />
//                 <h3 className="content-blog">Enter Content:</h3>
//                 <div className="contentformat">
//                 <div className="toolbar">
//                     <button type="button" onclick="formatText('bold')" className="bold">
//                     B
//                     </button>
//                     <button type="button" onclick="formatText('italic')" className="italic">
//                     I
//                     </button>
//                     <button
//                     type="button"
//                     onclick="formatText('classyred')"
//                     className="classyred"
//                     >
//                     R
//                     </button>
//                     <button id="upload-button" formNoValidate="formnovalidate">
//                     Upload Image
//                     </button>
//                     <button
//                     onClick={handleOpenModal}
//                     id="upload-link"
//                     formNoValidate="formnovalidate"
//                     >
//                     Embed Link
//                     </button>
//                     <button
//                     type="button"
//                     className="hyperlink"
//                     onClick={handleOpenModal}
//                     >
//                     Add Hyperlink
//                     </button>
//                 </div>
//                 <div className="content1">
//                     <textarea id="content" name="content" defaultValue={blog.content} />
//                 </div>
//                 </div>
//                 <Popup open={openModal} handleClose={handleCloseModal} />
//                 <h3 className="tags-blog">Enter Tags:</h3>
//                 <input
//                 type="text"
//                 id="tags"
//                 name="tags"
//                 defaultValue={blog.tags}
//                 />
//                 <h3 className="image-blog">Upload Thumbnail:</h3>
//                 <input
//                 type="file"
//                 id="image"
//                 name="thumbnail"
//                 defaultValue={blog.thumbnail_path}
//                 />
//                 <input
//                 type="hidden"
//                 name="old_thumbnail"
//                 defaultValue={blog.thumbnail_path}
//                 />
//                 <input type="hidden" name="id" defaultValue={ blog.id }/>
//                 <div className="submit-blogdiv">
//                 <button name="button" value="UPLOAD BLOG" id="submit-blog">
//                     SAVE CHANGES
//                 </button>
//                 </div>
//             </div>
//         </Layout>
//         </>
//     )
// }

// export async function getServerSideProps(context) {
//     const { id } = context.params
  
//     try {
//       const response = await axios.get(`http://127.0.0.1:4000/blogs/${id}`)
//       const blog = response.data
//       console.log(blog);
  
//       return { props: { blog } }
//     } catch (error) {
//       console.error('Error fetching data:', error)
//       return { props: { blog: null } }
//     }
//   }
