import { TaskDirective } from './task.directive';
import { Renderer2 } from '@angular/core';

describe('TaskDirective', () => {
  it('should create an instance', () => {

    // throws an error if we don't have these lines, it still works if we don't have them but it's annoying so w/e
    let elRefMock = {
      nativeElement: document.createElement('div')
    };
    let renderer2Mock:Renderer2;

    const directive = new TaskDirective(elRefMock, renderer2Mock);
    expect(directive).toBeTruthy();
  });
});
