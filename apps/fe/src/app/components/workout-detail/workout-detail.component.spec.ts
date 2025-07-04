import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { WorkoutService } from '../../services/workout.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutDetailComponent } from './workout-detail.component';
import { of, Subject, throwError } from 'rxjs';

describe('WorkoutDetailComponent', () => {
  let fixture: ComponentFixture<WorkoutDetailComponent>;
  let component: WorkoutDetailComponent;
  let workoutService;
  let route;
  let router;
  let workout;
  let paramSubject;
  let paramMap;

  beforeEach(() => {
    paramMap = new Map([['id', '1']]);
    paramSubject = new Subject();
    workout = { id: '1', exercises: [] };
    workoutService = {
      getWorkoutById: vi.fn().mockReturnValue(of(workout)),
    };
    route = {
      paramMap: paramSubject,
    };
    router = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: WorkoutService,
          useValue: workoutService,
        },
        {
          provide: ActivatedRoute,
          useValue: route,
        },
        {
          provide: Router,
          useValue: router,
        },
      ],
    });

    fixture = TestBed.createComponent(WorkoutDetailComponent);
    component = fixture.componentInstance;
  });

  describe('loading workout', () => {
    describe('on success', () => {
      it('loads the workout', () => {
        paramSubject.next(paramMap);
        fixture.detectChanges();
        expect(workoutService.getWorkoutById).toHaveBeenCalledWith('1');
        expect(component.workout).toEqual({ id: '1', exercises: [] });
        expect(component.loading).toEqual(false);
      });
    });

    describe('when it errors', () => {
      beforeEach(() => {
        workoutService.getWorkoutById.mockReturnValue(throwError(() => 'shit'));
      });

      it('navigates back to /workouts', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {
          return;
        });
        paramSubject.next(paramMap);
        fixture.detectChanges();
        expect(component.loading).toEqual(false);
        expect(router.navigate).toHaveBeenCalledWith(['/workouts']);
        expect(console.error).toHaveBeenCalledWith(
          'Error loading workout',
          'shit'
        );
      });
    });
  });
});
