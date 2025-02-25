import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import ModalBase from '../components/ModalBase';
import { useState } from 'react';
import listService from '../services/list.service';
import { useNavigate } from 'react-router-dom';

const CreateList = () => {
  const navigate = useNavigate();

  const [helpModal, setHelpModal] = useState(false);
  const [newList, setNewList] = useState({ protection: 1 });
  const [fieldErrors, setFieldErrors] = useState([]);

  const createNewList = () => {
    listService
      .createList(newList)
      .then(data => {
        toast.success('List created');
        navigate(`/lists/${data.uniqueUrl}`);
      })
      .catch(e => {
        try {
          const parsed = JSON.parse(e.message);
          setFieldErrors(parsed.message);
        } catch {
          toast.error(e?.message || 'Uncaught exception occured, please try again');
        }
      });
  };

  const getFieldError = fieldName => {
    return fieldErrors.find(f => f.field === fieldName);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen ">
      <div className="flex">
        <div className="flex items-center justify-center m-auto">
          <h1 className="text-3xl font-bold mb-6">Create Todo List</h1>
        </div>
      </div>

      <div className="flex">
        <div className="w-sm bg-white p-6 rounded shadow m-auto">
          <div className="flex flex-col space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              New list title
            </label>
            <input
              onChange={e => setNewList({ ...newList, name: e.target.value })}
              id="name"
              placeholder="Enter new list title"
              className={`w-full p-2 border rounded ${getFieldError('name') ? 'border-red-500' : ''}`}
            />
            {getFieldError('name') &&
              getFieldError('name').errors.map((error, index) => (
                <p key={`name-error-${index}`} className="text-xs text-red-500">
                  {error}
                </p>
              ))}
          </div>

          <div className="mt-5 flex flex-col space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password for list additional access
            </label>
            <input
              onChange={e => setNewList({ ...newList, password: e.target.value })}
              type="password"
              id="password"
              placeholder="Enter password"
              className={`w-full p-2 border rounded ${getFieldError('password') ? 'border-red-500' : ''}`}
            />
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <InformationCircleIcon className="size-4 text-gray-600" />
              <p>Password is requred for list deletion and freezing</p>
            </div>
            {getFieldError('password') &&
              getFieldError('password').errors.map((error, index) => (
                <p key={`password-error-${index}`} className="text-xs text-red-500">
                  {error}
                </p>
              ))}
          </div>

          <div className="mt-5 flex flex-col space-y-2">
            <label htmlFor="protection" className="text-sm font-medium text-gray-700">
              Select access type
            </label>
            <select
              onChange={e => setNewList({ ...newList, protection: parseInt(e.target.value) })}
              id="protection"
              className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldError('protection') ? 'border-red-500' : ''}`}
            >
              <option value="1">View and Edit</option>
              <option value="2">View</option>
              <option value="3">Password protected</option>
            </select>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <InformationCircleIcon className="size-12 text-gray-600" />
              <p>
                View and edit access grants all users with URL access to edit and view list, view access allows only to view list, and password protected list
                can only be opened with password
              </p>
            </div>

            {getFieldError('protection') &&
              getFieldError('protection').errors.map((error, index) => (
                <p key={`protection-error-${index}`} className="text-xs text-red-500">
                  {error}
                </p>
              ))}
          </div>

          <div className="py-3 sm:flex sm:flex-row-reverse">
            <button
              onClick={() => createNewList()}
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setHelpModal(true)}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Need Help?
            </button>
          </div>
        </div>

        <ModalBase show={helpModal} onClose={() => setHelpModal(false)}>
          <div className="sm:flex items-center justify-center content-center mb-4">
            <div className="mx-auto flex size-12 shrink-0 content-center items-center justify-center rounded-full bg-gray-100 sm:mx-0 sm:size-10">
              <InformationCircleIcon aria-hidden="true" className="size-6 text-gray-600" />
            </div>
          </div>
          <div className="sm:flex items-center justify-center content-center">
            <div className="mt-3">
              <ul className="list-disc list-inside text-gray-700">
                <li>Lists can be created by just specifying name and password for list</li>
                <li>Password is required for list deletion and freezing</li>
                <li>Also password can be used to protect the list completely, depending on which access type is selected on list creation</li>
                <li>Lists can be easily shared by just sharing URL</li>
                <li>Unique list URL will be available after list creation</li>
              </ul>
            </div>
          </div>
        </ModalBase>

        <ToastContainer />
      </div>
    </div>
  );
};

export default CreateList;
