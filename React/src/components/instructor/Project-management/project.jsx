import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../loader_component';
import { MdArrowForwardIos } from "react-icons/md";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { createMemoryRouter } from 'react-router-dom';
import Cookies from 'js-cookie';
import Select from "react-select";


function Project({updateState,showNotification,instructorId}) {
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [addData, setAddData] = useState({});


    const [isModalOpen, setModalOpen] = useState(false);
    const [isDimmed, setDimmed] = useState(false);

    const [selectedprojectId, setSelectedprojectId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);  // default page is 1
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);


    const handleCloseModal = () => {
        setModalOpen(false);
        setDimmed(false);
    };

   

    const [currentproject, setCurrentproject] = useState(null);
    const handleEditClick = (project) => {
        setCurrentproject(project);
        setEditData(project);
        setEditModalOpen(true);
        setDimmed(true);
    };
    const handleAddClick = (project) => {
        setCurrentproject(project);
        setAddData({}); // Clear previous data
        setAddModalOpen(true);
        setDimmed(true);
    };

    const [assignedProjects, setAssignedProjects] = useState([]);
    const [unassignedProjects, setUnassignedProjects] = useState([]);
    const handleEditAction = () => {
        setEditModalOpen(false);
        setDimmed(false);
    };
    const handleAddAction = () => {
        // Check if any of the required fields are empty
        if (!addData.title || !addData.description || !addData.projectEnding) {
            alert("Please fill in all required fields before adding a project.");
            return; // Exit the function if any field is empty
        }

        setAddModalOpen(false);
        setDimmed(false);
    };

    const handleCloseAction = () => {
        // Check if any of the required fields are empty


        setAddModalOpen(false);
        setDimmed(false);
    };

    const contentClassName = isDimmed ? 'dimmed' : '';

    const [Projects, setProjects] = useState([]);
  

    console.log(instructorId); // This will log the userId value

    const update = async (updatedData) => {
        try {
            // Extract properties excluding status and projectTag
            const { ...dataToSend } = updatedData;

            const { data } = await axios.put("http://localhost:3000/project/updateProject", dataToSend);
            console.log(data);

            // Update the respective state based on 'isAssigned' flag
            setAssignedProjects(prevProjects => {
                const updatedIndex = prevProjects.findIndex(project => project.projectId === updatedData.projectId);
                if (updatedIndex !== -1) {
                    const updatedProjects = [...prevProjects];
                    updatedProjects[updatedIndex] = updatedData;
                    return updatedProjects;
                }
                return prevProjects;
            });
            setUnassignedProjects(prevProjects => {
                const updatedIndex = prevProjects.findIndex(project => project.projectId === updatedData.projectId);
                if (updatedIndex !== -1) {
                    const updatedProjects = [...prevProjects];
                    updatedProjects[updatedIndex] = updatedData;
                    return updatedProjects;
                }
                return prevProjects;
            });


        } catch (error) {
            console.error("Error updating project:", error);
        }
    };

    const create = async (createdData) => {
        try {
            // Include the instructorId from cookies in the request data
            console.log("createdData", createdData)

            // Add instructorId to the data to be sent in the request
            const requestData = {
                ...createdData,
                instructorId: instructorId,
                projectStarting: new Date().toISOString().split('T')[0],
                projectTag: 'Unassigned'  // Set projectStarting to the current date
                // Set projectStarting to the current date

            };

            const { projectId, ...dataWithoutId } = requestData;  // Remove projectId if exists
            console.log("createdData", requestData);
            const { data } = await axios.post("http://localhost:3000/project/createProject", dataWithoutId);
            console.log(data);

            // Add the new project to the local state
            setUnassignedProjects(prevProjects => [...prevProjects, dataWithoutId]); // Assuming `data` contains the newly created project details

        } catch (error) {
            console.error("Error creating project:", error);
        }
    }





    const getAllProjects = async (pageNo) => {
        try {
            console.log("pageNo", pageNo);
            setCurrentPage(pageNo);  // Update the currentPage state

            const { data } = await axios.get("http://localhost:3000/project/getAllProjects", {
                params: {
                    instructorId: instructorId,
                    pageNo: pageNo
                }

            });
            setData(data);
            setTimeout(() => {
                setLoading(false);
            }, 500);
            console.log(data)
            if (data.response) {
                const formattedProjects = data.response.map(item => ({
                    title: item.title,
                    description: item.description,
                    projectId: item.projectId,
                    projectStarting: item.projectStarting,
                    projectEnding: item.projectEnding,
                    projectTag: item.projectTag,
                    status: item.status,
                    // Assuming there is a property indicating whether the project is assigned
                }));

                // Categorize projects into assigned and unassigned
                const assigned = formattedProjects.filter(project => project.projectTag === "Assigned");
                const unassigned = formattedProjects.filter(project => project.projectTag === "Unassigned");

                setAssignedProjects(assigned);
                setUnassignedProjects(unassigned);
            }
        } catch (error) {
            console.error("Error fetching Projects:", error);
            setLoading(false);
        }
    };


    const blockUser = async (project) => {
        try {
            const { data } = await axios.put("http://localhost:3000/user/updateUser", {
                userId: project,
                isBlocked: true
            });
            console.log(data.response)
        } catch (error) {
            console.error("Error approving request:", error);
            alert("Failed to approve request. Please try again.");
        }
    };

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedProjectForDelete, setSelectedProjectForDelete] = useState(null);
    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setDimmed(false);
    };

    const deleteProject = async (projectId) => {
        try {
            const { data } = await axios.delete("http://localhost:3000/project/deleteProject", {
                params:{
                projectId: projectId,
                }
            });
            console.log(data.response);

            // Update state to remove the deleted project
            setAssignedProjects(prevProjects => prevProjects.filter(project => project.projectId !== projectId));
            setUnassignedProjects(prevProjects => prevProjects.filter(project => project.projectId !== projectId));

            // Close the delete modal
            setDeleteModalOpen(false);
        } catch (error) {
            console.error("Error deleting project:", error);
            alert("Failed to delete project. Please try again.");
        }
    };



    const handleDeleteClick = (project) => {
        setSelectedProjectForDelete(project);

        setDeleteModalOpen(true);
        setDimmed(true);

    };
    useEffect(() => {
        // Call getAllProjects with an initial page number when the component mounts
        getAllProjects(1);
    }, []);  // Include getAllProjects in the dependency array

    return (
        <div className="z-0">
            {loading ? <div className="flex ps-48 items-center justify-center h-screen">
                <div className="w-16 h-16  border-4 border-dashed rounded-full animate-spin border-violet-400"></div>
            </div>
                : (                <div className="data-container">
                    <div className={`className="h-screen w-screen  justify-center items-center  ${showNotification ? 'blurr -z-50' : ''}`}>
                        {isEditModalOpen && (
                            <div className="modal-container  flex items-center justify-center z-100">
                                <div className="absolute  bg-black opacity-50" onClick={() => setEditModalOpen(false)}></div>
                                <div className="flex flex-col w-form gap-2 p-6 rounded-md shadow-md bg-white opacity-100 text-black">
                                    <h2 className="text-xl font-semibold text-center leading tracking">
                                        Edit project
                                    </h2>
                                    <div className="mt-4">
                                        {/* Here you can have your edit form fields */}
                                        {/* For example: */}
                                        <label htmlFor="Title">Title</label><br />

                                        <input
                                            type="text"
                                            value={editData.title || ''}
                                            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Title"
                                            className="border w-full p-2 mb-2"

                                        /><br />
                                        <label htmlFor="Description">Description</label><br />
                                        <input
                                            type="text"
                                            value={editData.description || ''}
                                            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Description"
                                            className="border p-2 w-full mb-2"
                                        /><br />
                                        <label htmlFor="Start Date">Start Date</label><br />
                                        <input
                                            type="date"
                                            value={editData.projectStarting || ''}
                                            onChange={(e) => setEditData(prev => ({ ...prev, projectStarting: e.target.value }))}
                                            className="border p-2 w-full mb-2"
                                        /><br />
                                        <label htmlFor="Deadline">Deadline</label><br />
                                        <input
                                            type="date"
                                            value={editData.projectEnding || ''}
                                            onChange={(e) => setEditData(prev => ({ ...prev, projectEnding: e.target.value }))}
                                            min={new Date().toISOString().split('T')[0]} // Set min attribute to today's date
                                            className="border p-2 w-full mb-2"
                                        /><br />
                                        {/* Project Tag */}
                                        <label htmlFor="Project Tag">Project Tag</label><br />
                                        <Select
                                            value={{ label: editData.projectTag || '', value: editData.projectTag || '' }}
                                            onChange={(selectedOption) => setEditData(prev => ({ ...prev, projectTag: selectedOption.value }))}
                                            options={[{ label: 'Assigned', value: 'Assigned' }, { label: 'Unassigned', value: 'Unassigned' }]}
                                        />
                                        <br />

                                        {/* Status */}
                                        <label htmlFor="Status">Status</label><br />
                                        <Select
                                            value={{ label: editData.status || '', value: editData.status || '' }}
                                            onChange={(selectedOption) => setEditData(prev => ({ ...prev, status: selectedOption.value }))}
                                            options={[{ label: 'Pending', value: 'Pending' }, { label: 'Completed', value: 'Completed' }]}
                                        />
                                        <br />


                                        {/* ... other fields */}
                                    </div>
                                    <div className="flex justify-end mt-6">
                                        <button className="px-6 py-2 rounded-sm shadow-sm bg-gray-200 text-black" onClick={handleEditAction}>Close</button>
                                        <button className="px-6 py-2 rounded-sm shadow-sm bg-indigo-500 text-white ml-2" onClick={() => { handleEditAction(); update(editData); }}>Add</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isAddModalOpen && (
                            <div className="modal-container rounded-md flex items-center justify-center z-100">
                                <div className="absolute  rounded-md bg-black opacity-50" onClick={() => setEditModalOpen(false)}></div>
                                <div className="flex flex-col  w-form gap-2 p-6 rounded-md shadow-md bg-white opacity-100 text-black">
                                    <h2 className="text-xl  font-semibold text-center leading tracking">
                                        Add project
                                    </h2>
                                    <div className="mt-4">
                                        {/* Here you can have your edit form fields */}
                                        {/* For example: */}
                                        <label htmlFor="Title">Title</label><br />

                                        <input
                                            required
                                            type="text"
                                            value={addData.title || ''}
                                            onChange={(e) => setAddData(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Title"
                                            className="border w-full p-2 mb-2"
                                        /><br />
                                        <label htmlFor="Description">Description</label><br />
                                        <input
                                            required
                                            type="text"
                                            value={addData.description || ''}
                                            onChange={(e) => setAddData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Description"
                                            className="border p-2 w-full mb-2"
                                        /><br />
                                        <label htmlFor="Deadline">Deadline</label><br />
                                        <input
                                            required
                                            type="date"
                                            value={addData.projectEnding || ''}
                                            onChange={(e) => setAddData(prev => ({ ...prev, projectEnding: e.target.value }))}
                                            min={new Date().toISOString().split('T')[0]} // Set min attribute to today's date
                                            className="border p-2 w-full mb-2"
                                        /><br />
                                        {/* ... other fields */}
                                    </div>
                                    <div className="flex justify-end mt-6">
                                        <button className="px-6 py-2 rounded-sm shadow-sm bg-gray-200 text-black hover:bg-gray-300 hover:shadow-sm hover-effect" onClick={handleCloseAction}>Close</button>
                                        <button className="px-6 py-2 rounded-sm shadow-sm bg-indigo-500 text-white ml-2  hover:bg-indigo-600 hover:shadow-md hover-effect" onClick={() => { handleAddAction(); create(addData); }}>Add</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isDeleteModalOpen && (
                            <div className="modal-container flex items-center justify-center z-100">
                                <div className="absolute bg-black opacity-50" onClick={handleCloseDeleteModal}></div>
                                <div className="flex flex-col w-form gap-2 p-6 rounded-md shadow-md bg-white opacity-100 text-black">
                                    <h2 className="text-xl font-semibold text-center leading tracking">
                                        Delete Project
                                    </h2>
                                    <div className="mt-4">
                                        <p className="text-left mb-2">
                                            Are you sure you want to delete the project "{selectedProjectForDelete.title}"? If there is any associated team, that will be deleted too!
                                        </p>
                                    </div>
                                    <div className="flex justify-end mt-6">
                                        <button className="px-6 py-2 rounded-sm shadow-sm bg-gray-200 text-black" onClick={handleCloseDeleteModal}>
                                            Close
                                        </button>
                                        <button className="px-6 py-2 rounded-sm shadow-sm bg-red-500 text-white ml-2" onClick={() => { handleCloseModal(); deleteProject(selectedProjectForDelete.projectId); }}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={`h-screen w-screen fade-in  flex justify-end ${contentClassName} `}>
                            <div className=" px-3 ps-8 pe-8 w-10/12 h-5/6">
                                <nav aria-label="breadcrumb" className="text-black w-full p-4 dark:bg-gray-800 dark:text-gray-100">
                                    <ol className="text-black mt-6 flex h-8 space-x-2 dark:text-gray-100">
                                        <li className="text-black flex items-center">
                                            <a rel="noopener noreferrer" href="#" title="Back to homepage" className="text-black text-sm hover:text-black flex items-center hover:underline">Instructor</a>
                                        </li>
                                        <li className="flex items-center space-x-1">
                                            <span className="dark:text-gray-400">/</span>
                                            <a rel="noopener noreferrer" href="#" className="text-black text-sm hover:text-black flex items-center px-1 capitalize hover:underline">Projects</a>
                                        </li>

                                    </ol>
                                    <h3 className="font-bold text-2xl">Projects</h3>

                                </nav>
                                <div className="container  mx-auto sm:p-4 text-black" >
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-md mb-1 mt-5">Assigned Projects</h4>
                                        <button
                                            type="button"
                                            className="px-5 py-2  bg-indigo-500 text-white rounded-full dark:bg-gray-100 dark:text-gray-800 hover:bg-indigo-600 hover:shadow-md hover-effect"
                                            onClick={() => handleAddClick(Projects[0])}
                                        >
                                            Add Project
                                        </button>


                                    </div>
                                    <div className="overflow-x-auto shadow-md -ms-1 mt-1 bg-white">
                                        <table className="w-full  text-sm  border-collapse">
                                            <colgroup>
                                                {/* Add any column settings if needed */}
                                            </colgroup>
                                            <thead className="bg-white">
                                                <tr className="bg-indigo-500 text-sm text-white">
                                                    <th className="p-3 border border-gray-300">Project Title</th>
                                                    <th className="p-3 border border-gray-300">Description</th>
                                                    <th className="p-3 border border-gray-300">Start Date</th>
                                                    <th className="p-3 border border-gray-300">Deadline</th>
                                                    <th className="p-3 border border-gray-300">Status</th>


                                                    <th className="p-3 border border-gray-300">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {assignedProjects.map((project, index) => (

                                                    <tr key={index} className="border-b border-opacity-20 border-gray-700 bg-white">
                                                        <td className="p-3 border border-gray-300">
                                                            <p>{project.title}</p>
                                                        </td>
                                                        <td className="p-3 border border-gray-300">
                                                            <p>{project.description}</p>
                                                        </td>
                                                        <td className="p-3 border border-gray-300">
                                                            <p>{project.projectStarting}</p>
                                                        </td><td className="p-3 border border-gray-300">
                                                            <p>{project.projectEnding}</p>
                                                        </td>

                                                        <td className="p-3 border text-red-500  border-gray-300">
                                                            <p>{project.status}</p>
                                                        </td>
                                                        <td className="p-3 border border-gray-300">
                                                            <span className="px-3 py-2 text-white rounded-md bg-indigo-500 cursor-pointer hover:bg-indigo-600 hover:shadow-md hover-effect" onClick={() => handleEditClick(project)}>
                                                                <span>Edit</span>
                                                            </span>
                                                            <span className="px-3 py-2 ms-2 text-white rounded-md bg-red-500 cursor-pointer hover:bg-red-600 hover:shadow-md hover-effect" onClick={() => handleDeleteClick(project)}>
                                                                <span>Delete</span>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {assignedProjects.length === 0 && (
                                            <p className="text-left mt-4 ms-3 text-red-500">No project data yet.</p>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-md mb-2 mt-5">Unassigned Projects</h4>



                                    </div>
                                    <div className="overflow-x-auto shadow-md  bg-white">
                                        <table className="w-full text-sm border-collapse">
                                            <colgroup>
                                                {/* Add any column settings if needed */}
                                            </colgroup>
                                            <thead className="bg-white">
                                                <tr className="bg-indigo-500 text-sm text-white">
                                                    <th className="p-3 border border-gray-300">Project Title</th>
                                                    <th className="p-3 border border-gray-300">Description</th>
                                                    <th className="p-3 border border-gray-300">Start Date</th>
                                                    <th className="p-3 border border-gray-300">Deadline</th>

                                                    <th className="p-3 border border-gray-300">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {unassignedProjects.map((project, index) => (

                                                    <tr key={index} className="border-b border-opacity-20 border-gray-700 bg-white">
                                                        <td className="p-3 border border-gray-300">
                                                            <p>{project.title}</p>
                                                        </td>
                                                        <td className="p-3 border border-gray-300">
                                                            <p>{project.description}</p>
                                                        </td>
                                                        <td className="p-3 border border-gray-300">
                                                            <p>{project.projectStarting}</p>

                                                        </td><td className="p-3 border border-gray-300">
                                                            <p>{project.projectEnding}</p>
                                                        </td>

                                                        <td className="p-3 border border-gray-300">
                                                            <span className="px-3 py-2 text-white rounded-md bg-indigo-500 cursor-pointer hover:bg-indigo-600 hover:shadow-md hover-effect" onClick={() => handleEditClick(project)}>
                                                                <span>Edit</span>
                                                            </span>
                                                            <span className="px-3 py-2 ms-2 text-white rounded-md bg-red-500 cursor-pointer hover:bg-red-600 hover:shadow-md hover-effect" onClick={() => handleDeleteClick(project)}>
                                                                <span>Delete</span>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {unassignedProjects.length === 0 && (
                                            <p className="text-left mt-4 ms-3 text-red-500">No project data yet.</p>
                                        )}
                                    </div>
                                    {/* <div className="flex justify-end me-28 space-x-1 mt-3 dark:text-gray-100">
                                        <button type="button" onClick={() => getAllProjects(1)} title="Page 1" className="bg-white inline-flex items-center justify-center w-8 h-8 text-sm font-semibold border rounded shadow-md dark:bg-gray-900 dark:text-violet-400 dark:border-violet-400">1</button>
                                        <button type="button" onClick={() => getAllProjects(2)} className="bg-white inline-flex items-center justify-center w-8 h-8 text-sm border rounded shadow-md dark:bg-gray-900 dark:border-gray-800" title="Page 2">2</button>
                                        <button type="button" onClick={() => getAllProjects(3)} className="bg-white inline-flex items-center justify-center w-8 h-8 text-sm border rounded shadow-md dark:bg-gray-900 dark:border-gray-800" title="Page 3">3</button>
                                        <button type="button" onClick={() => getAllProjects(4)} className="bg-white inline-flex items-center justify-center w-8 h-8 text-sm border rounded shadow-md dark:bg-gray-900 dark:border-gray-800" title="Page 4">4</button>
                                    </div> */}
                                </div>
                                <pre>{(data, null)}</pre>

                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default Project;
