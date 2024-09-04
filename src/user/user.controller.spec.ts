// import { Test, TestingModule } from '@nestjs/testing';
// import { UserController } from './user.controller';
// import { UserService } from './user.service';
// import { JwtService } from '@nestjs/jwt';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { User } from './entities/user.entity';
// import { Repository } from 'typeorm';

// describe('UserController', () => {
//   let controller: UserController;
//   let service: UserService;

//   const mockUserRepository = {
//     findOneBy: jest.fn(),
//     save: jest.fn(),
//     find: jest.fn(),
//     delete: jest.fn(),
//   };

//   const mockJwtService = {
//     sign: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UserController],
//       providers: [
//         UserService,
//         {
//           provide: getRepositoryToken(User),
//           useValue: mockUserRepository,
//         },
//         {
//           provide: JwtService,
//           useValue: mockJwtService,
//         },
//       ],
//     }).compile();

//     controller = module.get<UserController>(UserController);
//     service = module.get<UserService>(UserService);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   // Additional test cases can be added here...
// });
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { Request, Response } from 'express';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    create: jest.fn(),
    login: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockRequest = {
    cookies: { 'jwt': 'mockedJwtToken' },
  } as unknown as Request;

  const mockResponse = {
    cookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = { email: 'test@example.com', username: 'testuser', password: 'password123' };
      const result = { id: 1, ...createUserDto };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      const response = await controller.create(createUserDto);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(response).toEqual(result);
    });
  });

  describe('login', () => {
    it('should login a user and set a JWT cookie', async () => {
      const result = 
        {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123', // Include all required properties
        };
      const jwt = 'mockedJwtToken';

      jest.spyOn(service, 'login').mockResolvedValue(result);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(jwt);

      const response = mockResponse;
      await controller.login(result.username, result.password, response);

      expect(service.login).toHaveBeenCalledWith(result.username, result.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ id: result.id });
      expect(response.cookie).toHaveBeenCalledWith('jwt', jwt, { httpOnly: true });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = [
        {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123', // Include all required properties
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      const response = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(response).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a user by id if JWT is valid', async () => {
      const id = "1";
      const result = 
        {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123', // Include all required properties
        };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ id: 1 });
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      const response = await controller.findOne(id, mockRequest);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('mockedJwtToken');
      expect(service.findOne).toHaveBeenCalledWith(+id);
      expect(response).toEqual(result);
    });

    it('should throw UnauthorizedException if JWT is invalid', async () => {
      const id = '1';

      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new UnauthorizedException());

      await expect(controller.findOne(id, mockRequest)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    it('should update a user if JWT is valid', async () => {
      const id = '1';
      const updateUserDto = { email: 'updated@example.com', username: 'updateduser', password: 'newpassword' };
      const result = { id: 1, ...updateUserDto };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ id: 1 });
      jest.spyOn(service, 'update').mockResolvedValue(result);

      const response = await controller.update(id, updateUserDto, mockRequest);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('mockedJwtToken');
      expect(service.update).toHaveBeenCalledWith(+id, updateUserDto);
      expect(response).toEqual(result);
    });

    it('should throw UnauthorizedException if JWT is invalid', async () => {
      const id = '1';
      const updateUserDto = { email: 'updated@example.com', username: 'updateduser', password: 'newpassword' };

      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new UnauthorizedException());

      await expect(controller.update(id, updateUserDto, mockRequest)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    it('should remove a user if JWT is valid', async () => {
      const id = '1';

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ id: 1 });
      const mockDeleteResult: DeleteResult = {
        raw: {},
        affected: 1,
      };
      jest.spyOn(service, 'remove').mockResolvedValue(mockDeleteResult);

      const response = await controller.remove(id, mockRequest);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('mockedJwtToken');
      expect(service.remove).toHaveBeenCalledWith(+id);
      expect(response).toEqual(mockDeleteResult);
    });

    it('should throw UnauthorizedException if JWT is invalid', async () => {
      const id = '1';

      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new UnauthorizedException());

      await expect(controller.remove(id, mockRequest)).rejects.toThrow(UnauthorizedException);
    });
  });
});
