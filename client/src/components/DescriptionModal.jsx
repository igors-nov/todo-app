import { DialogTitle } from '@headlessui/react';
import { DocumentTextIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import ModalBase from './ModalBase';

export default function DescriptionModal(params) {
  return (
    <ModalBase {...params}>
      <div className="sm:flex items-center justify-center content-center mb-4">
        <div className="mx-auto flex size-12 shrink-0 content-center items-center justify-center rounded-full bg-gray-100 sm:mx-0 sm:size-10">
          <DocumentTextIcon aria-hidden="true" className="size-6 text-gray-600" />
        </div>
      </div>
      <div className="sm:flex items-center justify-center content-center">
        <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
          <DialogTitle as="h3" className="text-center text-base font-semibold text-gray-900">
            Adding task description
          </DialogTitle>
          <div className="mt-2">
            <textarea
              placeholder="Please enter description..."
              rows={10}
              value={params.description}
              onChange={e => params.setDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <InformationCircleIcon className="size-4 text-gray-600" />
              <p>Markdown formatting can be used</p>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
