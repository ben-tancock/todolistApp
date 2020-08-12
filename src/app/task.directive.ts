import { Directive, ElementRef, HostListener, Input, Renderer2, ViewChild } from '@angular/core'; // we import a lot extra here, is required for the functionality

@Directive({
  selector: '[taskDirective]'
})

// The following details the behaviour we are applying to every task object. When the user hovers their mouse over one, I want something to happen (also implement click functionality later)
export class TaskDirective {
  @ViewChild('taskDescription') taskDescription: ElementRef;

  //isClicked = false;

  constructor(private _elRef: ElementRef, private _renderer: Renderer2) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.background('lightgrey');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.background('transparent');

  }

  @HostListener('click') onMouseClick(){
    this.background('lightgrey');
  }



  //this is a function, it used to change the border as the mouse entered / left the element (mouse behaviour was due to functions above)
  private border(
    color: string = null,
    type: string = null,
    width: string = null
  ){
    this._renderer.setStyle(
      this._elRef.nativeElement, 'border-color', color
    );
    this._renderer.setStyle(
      this._elRef.nativeElement, 'border-style', type
    );
    this._renderer.setStyle(
      this._elRef.nativeElement, 'border-width', width
    );
  }

  private background(
    color: string = null
  ){
    this._renderer.setStyle(
      this._elRef.nativeElement, 'background-color', color
    );

  }

}
