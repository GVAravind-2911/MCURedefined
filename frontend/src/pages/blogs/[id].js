import { useRouter } from "next/router";
import axios from "axios";
import DOMPurify from "isomorphic-dompurify";
import Layout from "@/components/Layout";

export default function page({ blog }){
    const router = useRouter();
    const { id } = router.query;

    return (
        <>
        <Layout>
        <div className='contents fade-in'>
            <div className="contentsinfo">
                <h1 className="title">{blog.title}</h1>
                <h3 className="byline"><span className='colorforby'>By: </span>{blog.author}</h3>
                <h3 className="datecreation"><span className='colorforby'>Posted: </span>{blog.created_at}</h3>
                {blog.updated_at && <h3 className="dateupdate"><span className='colorforby'>Updated: </span>{blog.updated_at}</h3>}
                <span className="tagsspan">
                    {blog.tags.map(tag => (
                        <button className="tags">{tag}</button>
                    ))}
                </span>
            </div>
        <div className="contentsmain">
            <p className="maincontent" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}></p>
        </div>
        </div>
        </Layout>
        </>
    )
}

export async function getServerSideProps(context) {
    const { id } = context.params
  
    try {
      const response = await axios.get(`http://127.0.0.1:4000/blogs/${id}`)
      const blog = response.data
      console.log(blog);
  
      return { props: { blog } }
    } catch (error) {
      console.error('Error fetching data:', error)
      return { props: { blog: null } }
    }
  }
