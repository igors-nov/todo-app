import { DialogTitle } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ModalBase from './ModalBase';

export default function SubTaskModal(params) {
  return (
    <ModalBase {...params}>
      <div className="sm:flex items-center justify-center content-center mb-4">
        <div className="mx-auto flex size-12 shrink-0 content-center items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:size-10">
          <PlusIcon aria-hidden="true" className="size-6 text-green-600" />
        </div>
      </div>
      <div className="sm:flex items-center justify-center content-center">
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <DialogTitle as="h3" className="text-center text-base font-semibold text-gray-900">
            Adding new subtask
          </DialogTitle>
          <div className="mt-2">
            <input
              value={params.description}
              onChange={e => params.setDescription(e.target.value)}
              type="text"
              placeholder="New task"
              className="p-2 border rounded w-100"
            />
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
